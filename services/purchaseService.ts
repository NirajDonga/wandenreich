import mongoose, { Types } from 'mongoose';
import PurchaseOrder, { IPurchaseOrder } from '../models/PurchaseOrder';
import PurchaseItem from '../models/PurchaseItem';
import ProductVariant from '../models/ProductVariant';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import Supplier from '../models/Supplier';
import connectDB from '../lib/mongodb';

// Extended interface for PurchaseOrder that includes orderNumber property
interface IPurchaseOrderWithNumber extends IPurchaseOrder {
  orderNumber?: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  orderDate?: Date;
  expectedDeliveryDate?: Date;
  notes?: string;
  createdBy?: string;
  items: {
    productVariantId: string;
    quantity: number;
    unitCost: number;
  }[];
}

export interface UpdatePurchaseOrderInput {
  orderId: string;
  supplierId?: string;
  orderDate?: Date;
  expectedDeliveryDate?: Date;
  status?: 'pending' | 'received' | 'cancelled';
  notes?: string;
}

export interface ReceivePurchaseInput {
  orderId: string;
  receivedItems: {
    purchaseItemId: string;
    receivedQuantity: number;
  }[];
}

/**
 * Generate a unique order number for purchase orders
 * Format: PO-YYYYMMDD-XXX (XXX is a sequential number)
 */
const generateOrderNumber = async () => {
  await connectDB();
  
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Find the latest purchase order from today
  const latestOrder = await PurchaseOrder.findOne({
    orderNumber: { $regex: `PO-${datePart}-` }
  }, {}, { sort: { orderNumber: -1 } }).lean();
  
  let sequenceNumber = 1;
  
  if (latestOrder) {
    // Cast to unknown first to avoid TypeScript errors when accessing orderNumber
    const orderDoc = latestOrder as unknown as { orderNumber?: string };
    if (orderDoc.orderNumber) {
      const parts = orderDoc.orderNumber.split('-');
      if (parts.length === 3) {
        sequenceNumber = parseInt(parts[2], 10) + 1;
      }
    }
  }
  
  // Format sequence number with leading zeros
  const sequencePart = sequenceNumber.toString().padStart(3, '0');
  return `PO-${datePart}-${sequencePart}`;
};

/**
 * Create a new purchase order
 */
export const createPurchaseOrder = async (data: CreatePurchaseOrderInput) => {
  await connectDB();
  
  // Start a transaction
  const session = await PurchaseOrder.startSession();
  session.startTransaction();
  
  try {
    // Generate a unique order number
    const orderNumber = await generateOrderNumber();
    
    // Calculate total amount from items
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);
    
    // Create the purchase order
    const newOrder = await PurchaseOrder.create([{
      supplierId: data.supplierId,
      orderNumber,
      orderDate: data.orderDate || new Date(),
      expectedDeliveryDate: data.expectedDeliveryDate,
      status: 'pending',
      totalAmount: totalAmount,
      notes: data.notes,
      createdBy: data.createdBy
    }], { session });
    
    const purchaseOrderId = newOrder[0]._id;
    
    // Create purchase items
    const purchaseItems = await Promise.all(
      data.items.map(item => {
        const subtotal = item.quantity * item.unitCost;
        
        return PurchaseItem.create([{
          purchaseOrderId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          receivedQuantity: 0,
          subtotal
        }], { session });
      })
    );
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    // Return the created purchase order with its items
    return {
      purchaseOrder: newOrder[0],
      purchaseItems: purchaseItems.map(item => item[0])
    };
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get all purchase orders with pagination and filtering
 */
export const getPurchaseOrders = async (
  page = 1, 
  limit = 10, 
  status?: string,
  supplierId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  await connectDB();
  
  // Build filter
  const filter: any = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (supplierId) {
    filter.supplierId = supplierId;
  }
  
  if (startDate || endDate) {
    filter.orderDate = {};
    if (startDate) filter.orderDate.$gte = startDate;
    if (endDate) filter.orderDate.$lte = endDate;
  }
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCount = await PurchaseOrder.countDocuments(filter);
  
  // Get purchase orders with supplier info
  const purchaseOrders = await PurchaseOrder.find(filter)
    .populate('supplierId', 'name contactName')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  return {
    purchaseOrders,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Get a purchase order by ID with its items
 */
export const getPurchaseOrderById = async (id: string) => {
  await connectDB();
  
  // Get the purchase order
  const purchaseOrder = await PurchaseOrder.findById(id)
    .populate('supplierId', 'name contactName email phone address')
    .lean();
  
  if (!purchaseOrder) {
    throw new Error('Purchase order not found');
  }
  
  // Get the purchase items
  const purchaseItems = await PurchaseItem.find({ purchaseOrderId: id })
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
    purchaseOrder,
    purchaseItems
  };
};

/**
 * Update a purchase order's status and details
 */
export const updatePurchaseOrder = async (data: UpdatePurchaseOrderInput) => {
  await connectDB();
  
  const { orderId, ...updateData } = data;
  
  const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('supplierId', 'name contactName');
  
  if (!updatedOrder) {
    throw new Error('Purchase order not found');
  }
  
  return updatedOrder;
};

/**
 * Delete a purchase order and its items (only if status is 'pending')
 */
export const deletePurchaseOrder = async (id: string) => {
  await connectDB();
  
  // Start a transaction
  const session = await PurchaseOrder.startSession();
  session.startTransaction();
  
  try {
    // Check if the order exists and is in pending status
    const order = await PurchaseOrder.findById(id);
    
    if (!order) {
      throw new Error('Purchase order not found');
    }
    
    if (order.status !== 'pending') {
      throw new Error('Cannot delete a purchase order that is not in pending status');
    }
    
    // Delete the purchase items
    await PurchaseItem.deleteMany({ purchaseOrderId: id }, { session });
    
    // Delete the purchase order
    await PurchaseOrder.findByIdAndDelete(id, { session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    return { success: true, message: 'Purchase order deleted successfully' };
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Receive items from a purchase order - update inventory
 */
export const receivePurchaseOrder = async (data: ReceivePurchaseInput) => {
  await connectDB();
  
  // Start a transaction
  const session = await PurchaseOrder.startSession();
  session.startTransaction();
  
  try {
    // Get the purchase order
    const purchaseOrderDoc = await PurchaseOrder.findById(data.orderId);
    
    if (!purchaseOrderDoc) {
      throw new Error('Purchase order not found');
    }
    
    // Cast to the extended interface that includes orderNumber
    const purchaseOrder = purchaseOrderDoc as unknown as IPurchaseOrderWithNumber;
    
    if (purchaseOrder.status === 'cancelled') {
      throw new Error('Cannot receive items for a cancelled purchase order');
    }
    
    if (purchaseOrder.status === 'received') {
      throw new Error('Purchase order is already fully received');
    }
    
    // Process each received item
    for (const item of data.receivedItems) {
      // Get the purchase item
      const purchaseItem = await PurchaseItem.findById(item.purchaseItemId);
      
      if (!purchaseItem) {
        throw new Error(`Purchase item ${item.purchaseItemId} not found`);
      }
      
      if (purchaseItem.purchaseOrderId.toString() !== data.orderId) {
        throw new Error(`Purchase item ${item.purchaseItemId} does not belong to this order`);
      }
      
      // Check if the received quantity is valid
      const remainingQuantity = purchaseItem.quantity - purchaseItem.receivedQuantity;
      if (item.receivedQuantity > remainingQuantity) {
        throw new Error(`Received quantity exceeds ordered quantity for item ${item.purchaseItemId}`);
      }
      
      // Update the received quantity
      purchaseItem.receivedQuantity += item.receivedQuantity;
      await purchaseItem.save({ session });
      
      // Update inventory
      const inventory = await Inventory.findOne({ 
        productVariantId: purchaseItem.productVariantId 
      });
      
      if (inventory) {
        // Update existing inventory
        inventory.quantity += item.receivedQuantity;
        await inventory.save({ session });
        
        // Create inventory transaction
        await InventoryTransaction.create([{
          productVariantId: purchaseItem.productVariantId,
          transactionType: 'purchase',
          quantity: item.receivedQuantity,
          referenceId: purchaseOrder._id,
          referenceType: 'PurchaseOrder',
          notes: `Received from PO #${purchaseOrder.orderNumber || 'Unknown'}`
        }], { session });
      } else {
        // Create new inventory record
        await Inventory.create([{
          productVariantId: purchaseItem.productVariantId,
          quantity: item.receivedQuantity,
          minStockLevel: 0,
          maxStockLevel: 0
        }], { session });
        
        // Create inventory transaction
        await InventoryTransaction.create([{
          productVariantId: purchaseItem.productVariantId,
          transactionType: 'purchase',
          quantity: item.receivedQuantity,
          referenceId: purchaseOrder._id,
          referenceType: 'PurchaseOrder',
          notes: `Initial stock from PO #${purchaseOrder.orderNumber || 'Unknown'}`
        }], { session });
      }
    }
    
    // Check if all items are fully received
    const allPurchaseItems = await PurchaseItem.find({ purchaseOrderId: data.orderId });
    const isFullyReceived = allPurchaseItems.every(item => 
      item.receivedQuantity >= item.quantity
    );
    
    const isPartiallyReceived = allPurchaseItems.some(item => 
      item.receivedQuantity > 0 && item.receivedQuantity < item.quantity
    );
    
    // Update purchase order status
    if (isFullyReceived) {
      purchaseOrder.status = 'received';
    } else if (isPartiallyReceived) {
      purchaseOrder.status = 'partially-received';
    }
    
    await purchaseOrder.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    return { 
      success: true, 
      purchaseOrder,
      message: 'Items received successfully'
    };
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get all suppliers
 */
export const getSuppliers = async (page = 1, limit = 10, searchTerm = '') => {
  await connectDB();
  
  // Build filter
  const filter: any = {};
  
  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { contactName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCount = await Supplier.countDocuments(filter);
  
  // Get suppliers
  const suppliers = await Supplier.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  return {
    suppliers,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Create a new supplier
 */
export const createSupplier = async (supplierData: any) => {
  await connectDB();
  
  const newSupplier = await Supplier.create(supplierData);
  return newSupplier;
};

/**
 * Update a supplier
 */
export const updateSupplier = async (id: string, supplierData: any) => {
  await connectDB();
  
  const updatedSupplier = await Supplier.findByIdAndUpdate(
    id,
    { $set: supplierData },
    { new: true, runValidators: true }
  );
  
  if (!updatedSupplier) {
    throw new Error('Supplier not found');
  }
  
  return updatedSupplier;
};

/**
 * Get purchase statistics
 */
export const getPurchaseStatistics = async (
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
  
  // Get purchase statistics
  const totalPurchases = await PurchaseOrder.countDocuments({
    ...dateFilter,
    status: { $in: ['received', 'partially-received'] }
  });
  
  const pendingPurchases = await PurchaseOrder.countDocuments({
    ...dateFilter,
    status: 'pending'
  });
  
  const totalAmount = await PurchaseOrder.aggregate([
    { 
      $match: { 
        ...dateFilter,
        status: { $in: ['received', 'partially-received'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  return {
    totalPurchases,
    pendingPurchases,
    totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0
  };
};