import mongoose, { Types } from 'mongoose';
import SalesOrder from '../models/SalesOrder';
import SalesItem from '../models/SalesItem';
import Customer from '../models/Customer';
import ProductVariant from '../models/ProductVariant';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import connectDB from '../lib/mongodb';

// Define interfaces for better TypeScript support
interface ISalesOrderDocument {
  _id: string | Types.ObjectId;
  customerId: string | 'walk-in';
  orderNumber?: string;
  orderDate: Date;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subTotal: number;
  discount: number;
  taxAmount: number;
  netAmount: number;
  notes?: string;
  [key: string]: any;
}

export interface CreateSalesOrderInput {
  customerId: string | 'walk-in';
  orderDate?: Date;
  paymentMethod: 'cash' | 'credit' | 'bank-transfer' | 'online' | 'other';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  discount?: number;
  taxAmount?: number;
  notes?: string;
  items: {
    productVariantId: string;
    quantity: number;
    unitPrice: number; // Can be different from regular price (custom pricing)
    regularPrice: number;
    discount?: number;
  }[];
}

export interface UpdateSalesOrderInput {
  orderId: string;
  customerId?: string | 'walk-in';
  orderDate?: Date;
  status?: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'credit' | 'bank-transfer' | 'online' | 'other';
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  discount?: number;
  taxAmount?: number;
  notes?: string;
}

/**
 * Generate a unique invoice number for sales orders
 * Format: INV-YYYYMMDD-XXX (XXX is a sequential number)
 */
const generateInvoiceNumber = async () => {
  await connectDB();
  
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Find the latest sales order from today
  const latestOrder = await SalesOrder.findOne({
    invoiceNumber: { $regex: `INV-${datePart}-` }
  }, {}, { sort: { invoiceNumber: -1 } });
  
  let sequenceNumber = 1;
  
  if (latestOrder && latestOrder.invoiceNumber) {
    const parts = latestOrder.invoiceNumber.split('-');
    if (parts.length === 3) {
      sequenceNumber = parseInt(parts[2]) + 1;
    }
  }
  
  // Format sequence number with leading zeros
  const sequencePart = sequenceNumber.toString().padStart(3, '0');
  return `INV-${datePart}-${sequencePart}`;
};

/**
 * Create a new sales order and optionally complete it
 */
export const createSalesOrder = async (data: CreateSalesOrderInput) => {
  await connectDB();
  
  // Start a transaction
  const session = await SalesOrder.startSession();
  session.startTransaction();
  
  try {
    // Generate a unique invoice number
    const invoiceNumber = await generateInvoiceNumber();
    
    // Calculate totals
    const itemsTotal = data.items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
    
    const discount = data.discount || 0;
    const taxAmount = data.taxAmount || 0;
    const netAmount = itemsTotal - discount + taxAmount;
    
    // Create the sales order
    const newOrder = await SalesOrder.create([{
      customerId: data.customerId,
      invoiceNumber,
      orderDate: data.orderDate || new Date(),
      status: 'completed', // We're setting it to completed by default for sales
      totalAmount: itemsTotal,
      discount,
      taxAmount,
      netAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      notes: data.notes
    }], { session });
    
    const salesOrderId = newOrder[0]._id;
    
    // Create sales items and update inventory
    const salesItems = [];
    
    for (const item of data.items) {
      // Calculate item subtotal
      const itemDiscount = item.discount || 0;
      const subtotal = (item.unitPrice - itemDiscount) * item.quantity;
      
      // Create the sales item
      const salesItem = await SalesItem.create([{
        salesOrderId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        regularPrice: item.regularPrice,
        discount: itemDiscount,
        subtotal
      }], { session });
      
      salesItems.push(salesItem[0]);
      
      // Update inventory (decrease stock)
      const inventory = await Inventory.findOne({ 
        productVariantId: item.productVariantId 
      });
      
      if (!inventory) {
        throw new Error(`No inventory record found for product variant ${item.productVariantId}`);
      }
      
      if (inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product variant ${item.productVariantId}`);
      }
      
      // Decrease inventory
      inventory.quantity -= item.quantity;
      await inventory.save({ session });
      
      // Create inventory transaction
      await InventoryTransaction.create([{
        productVariantId: item.productVariantId,
        transactionType: 'sale',
        quantity: -item.quantity, // Negative because it's a reduction
        referenceId: salesOrderId,
        referenceType: 'SalesOrder',
        notes: `Sale invoice #${invoiceNumber}`
      }], { session });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    // Return the created sales order with its items
    return {
      salesOrder: newOrder[0],
      salesItems
    };
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancel a sales order and restock inventory
 */
export const cancelSalesOrder = async (orderId: string) => {
  await connectDB();
  
  // Start a transaction
  const session = await SalesOrder.startSession();
  session.startTransaction();
  
  try {
    // Get the sales order
    const salesOrderDoc = await SalesOrder.findById(orderId);
    
    if (!salesOrderDoc) {
      throw new Error('Sales order not found');
    }
    
    // Cast to our interface for type safety
    const salesOrder = salesOrderDoc as unknown as ISalesOrderDocument;
    
    if (salesOrder.status === 'cancelled') {
      throw new Error('Sales order is already cancelled');
    }
    
    // Get the sales items
    const salesItems = await SalesItem.find({ salesOrderId: orderId });
    
    // Restock inventory
    for (const item of salesItems) {
      // Get the inventory record
      const inventory = await Inventory.findOne({ 
        productVariantId: item.productVariantId 
      });
      
      if (inventory) {
        // Increase inventory (restock)
        inventory.quantity += item.quantity;
        await inventory.save({ session });
        
        // Create inventory transaction
        await InventoryTransaction.create([{
          productVariantId: item.productVariantId,
          transactionType: 'restock',
          quantity: item.quantity,
          referenceId: salesOrder._id,
          referenceType: 'SalesOrder',
          notes: `Cancelled sale invoice #${salesOrder.invoiceNumber}`
        }], { session });
      }
    }
    
    // Update the sales order status
    salesOrder.status = 'cancelled';
    await salesOrder.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    return {
      success: true,
      salesOrder
    };
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get all sales orders with pagination and filtering
 */
export const getSalesOrders = async (
  page = 1, 
  limit = 10, 
  status?: string,
  customerId?: string,
  startDate?: Date,
  endDate?: Date,
  paymentStatus?: string
) => {
  await connectDB();
  
  // Build filter
  const filter: any = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (customerId) {
    filter.customerId = customerId;
  }
  
  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }
  
  if (startDate || endDate) {
    filter.orderDate = {};
    if (startDate) filter.orderDate.$gte = startDate;
    if (endDate) filter.orderDate.$lte = endDate;
  }
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCount = await SalesOrder.countDocuments(filter);
  
  // Get sales orders with customer info
  const salesOrders = await SalesOrder.find(filter)
    .populate('customerId', 'name email phone')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Process walk-in customers
  const processedOrders = salesOrders.map(order => {
    if (order.customerId === 'walk-in') {
      return {
        ...order,
        customerId: {
          _id: 'walk-in',
          name: 'Walk-in Customer',
          email: '',
          phone: ''
        }
      };
    }
    return order;
  });
  
  return {
    salesOrders: processedOrders,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Get a sales order by ID with its items
 */
export const getSalesOrderById = async (id: string) => {
  await connectDB();
  
  // Get the sales order
  const salesOrderDoc = await SalesOrder.findById(id).lean();
  
  if (!salesOrderDoc) {
    throw new Error('Sales order not found');
  }
  
  // Cast to our interface for type safety
  const salesOrder = salesOrderDoc as unknown as ISalesOrderDocument;
  
  // Handle walk-in customer
  let customer;
  if (salesOrder.customerId === 'walk-in') {
    customer = {
      _id: 'walk-in',
      name: 'Walk-in Customer',
      email: '',
      phone: '',
      address: ''
    };
  } else {
    // Get customer details
    const customerDoc = await Customer.findById(salesOrder.customerId).lean();
    if (!customerDoc) {
      throw new Error('Customer not found');
    }
    customer = customerDoc;
  }
  
  // Get the sales items
  const salesItems = await SalesItem.find({ salesOrderId: id })
    .populate({
      path: 'productVariantId',
      populate: {
        path: 'productId',
        select: 'name sku unitOfMeasureId',
        populate: {
          path: 'unitOfMeasureId',
          select: 'name abbreviation'
        }
      }
    })
    .lean();
  
  return {
    salesOrder: {
      ...salesOrder,
      customer
    },
    salesItems
  };
};

/**
 * Update a sales order's payment status
 */
export const updateSalesOrderPayment = async (id: string, paymentStatus: string) => {
  await connectDB();
  
  const updatedOrder = await SalesOrder.findByIdAndUpdate(
    id,
    { $set: { paymentStatus } },
    { new: true, runValidators: true }
  );
  
  if (!updatedOrder) {
    throw new Error('Sales order not found');
  }
  
  return updatedOrder;
};

/**
 * Get sales statistics
 */
export const getSalesStatistics = async (
  startDate?: Date,
  endDate?: Date
) => {
  await connectDB();
  
  // Build date filter
  const dateFilter: any = {};
  
  if (startDate || endDate) {
    dateFilter.orderDate = {};
    if (startDate) dateFilter.orderDate.$gte = startDate;
    if (endDate) dateFilter.orderDate.$lte = endDate;
  }
  
  // Get sales statistics
  const completedSales = await SalesOrder.countDocuments({
    ...dateFilter,
    status: 'completed'
  });
  
  const totalRevenue = await SalesOrder.aggregate([
    { 
      $match: { 
        ...dateFilter,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$netAmount' }
      }
    }
  ]);
  
  const pendingPayments = await SalesOrder.aggregate([
    { 
      $match: { 
        ...dateFilter,
        paymentStatus: { $in: ['partial', 'unpaid'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$netAmount' }
      }
    }
  ]);
  
  const topProducts = await SalesItem.aggregate([
    {
      $lookup: {
        from: 'salesorders',
        localField: 'salesOrderId',
        foreignField: '_id',
        as: 'order'
      }
    },
    {
      $unwind: '$order'
    },
    {
      $match: {
        'order.status': 'completed',
        ...dateFilter
      }
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: 'productVariantId',
        foreignField: '_id',
        as: 'variant'
      }
    },
    {
      $unwind: '$variant'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'variant.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $group: {
        _id: '$productVariantId',
        productName: { $first: '$product.name' },
        variantName: { $first: '$variant.name' },
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$subtotal' }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: 5
    }
  ]);
  
  return {
    completedSales,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    pendingPayments: pendingPayments.length > 0 ? pendingPayments[0].total : 0,
    topProducts
  };
};

/**
 * Get all customers
 */
export const getCustomers = async (page = 1, limit = 10, searchTerm = '') => {
  await connectDB();
  
  // Build filter
  const filter: any = {};
  
  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCount = await Customer.countDocuments(filter);
  
  // Get customers
  const customers = await Customer.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  return {
    customers,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Create a new customer
 */
export const createCustomer = async (customerData: any) => {
  await connectDB();
  
  const newCustomer = await Customer.create(customerData);
  return newCustomer;
};

/**
 * Update a customer
 */
export const updateCustomer = async (id: string, customerData: any) => {
  await connectDB();
  
  const updatedCustomer = await Customer.findByIdAndUpdate(
    id,
    { $set: customerData },
    { new: true, runValidators: true }
  );
  
  if (!updatedCustomer) {
    throw new Error('Customer not found');
  }
  
  return updatedCustomer;
};