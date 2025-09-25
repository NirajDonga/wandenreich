import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import Payment from '../models/Payment';
import CustomerLedger from '../models/CustomerLedger';
import SupplierLedger from '../models/SupplierLedger';
import Customer from '../models/Customer';
import Supplier from '../models/Supplier';
import SalesOrder from '../models/SalesOrder';
import PurchaseOrder from '../models/PurchaseOrder';

// TypeScript interfaces for document types
interface ICustomerLedgerDocument {
  _id: mongoose.Types.ObjectId;
  customerId: string;
  transactionDate: Date;
  transactionType: string;
  referenceId: mongoose.Types.ObjectId;
  referenceNumber: string;
  debit: number;
  credit: number;
  balance: number;
  notes?: string;
  __v?: number;
}

interface ISupplierLedgerDocument {
  _id: mongoose.Types.ObjectId;
  supplierId: string;
  transactionDate: Date;
  transactionType: string;
  referenceId: mongoose.Types.ObjectId;
  referenceNumber: string;
  debit: number;
  credit: number;
  balance: number;
  notes?: string;
  __v?: number;
}

interface ICustomerDocument {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  [key: string]: any;
}

interface ISupplierDocument {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  [key: string]: any;
}

interface IPaymentDocument {
  _id: mongoose.Types.ObjectId;
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes?: string;
  transactionType: 'customer-payment' | 'supplier-payment';
  entityId: string;
  referenceIds?: string[];
  __v?: number;
}

/**
 * Record a payment from a customer and update their ledger
 */
export const recordCustomerPayment = async (paymentData: {
  customerId: string;
  amount: number;
  paymentDate?: Date;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  referenceIds?: string[]; // Optional sales order IDs this payment applies to
}) => {
  await connectDB();
  
  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Validate customer exists unless it's a walk-in customer
    if (paymentData.customerId !== 'walk-in') {
      const customer = await Customer.findById(paymentData.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
    }
    
    // Create payment record
    const payment = await Payment.create([{
      paymentDate: paymentData.paymentDate || new Date(),
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber || `RCPT-${Date.now()}`,
      notes: paymentData.notes,
      transactionType: 'customer-payment',
      entityId: paymentData.customerId,
      referenceIds: paymentData.referenceIds
    }], { session });
    
    const paymentId = payment[0]._id;
    const referenceNumber = payment[0].referenceNumber;
    
    // Get the latest customer ledger entry to find current balance
    const lastLedgerEntry = await CustomerLedger.findOne(
      { customerId: paymentData.customerId },
      {},
      { sort: { transactionDate: -1 } }
    ).lean() as ICustomerLedgerDocument | null;
    
    const previousBalance = lastLedgerEntry && lastLedgerEntry.balance !== undefined ? lastLedgerEntry.balance : 0;
    const newBalance = previousBalance - paymentData.amount;
    
    // Create ledger entry
    await CustomerLedger.create([{
      customerId: paymentData.customerId,
      transactionDate: paymentData.paymentDate || new Date(),
      transactionType: 'payment',
      referenceId: paymentId,
      referenceNumber: referenceNumber,
      debit: 0,
      credit: paymentData.amount,
      balance: newBalance,
      notes: paymentData.notes
    }], { session });
    
    // If specific sales orders are referenced, we can update their payment status
    if (paymentData.referenceIds && paymentData.referenceIds.length > 0) {
      for (const orderId of paymentData.referenceIds) {
        const order = await SalesOrder.findById(orderId);
        if (order) {
          // Check if the payment completes the order payment
          // This is a simple implementation, in a real scenario you might need 
          // to handle partial payments more carefully
          if (order.netAmount <= paymentData.amount) {
            order.paymentStatus = 'paid';
          } else {
            order.paymentStatus = 'partial';
          }
          await order.save({ session });
        }
      }
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    return payment[0];
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Record a payment to a supplier and update their ledger
 */
export const recordSupplierPayment = async (paymentData: {
  supplierId: string;
  amount: number;
  paymentDate?: Date;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  referenceIds?: string[]; // Optional purchase order IDs this payment applies to
}) => {
  await connectDB();
  
  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Validate supplier exists
    const supplier = await Supplier.findById(paymentData.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    // Create payment record
    const payment = await Payment.create([{
      paymentDate: paymentData.paymentDate || new Date(),
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber || `PAY-${Date.now()}`,
      notes: paymentData.notes,
      transactionType: 'supplier-payment',
      entityId: paymentData.supplierId,
      referenceIds: paymentData.referenceIds
    }], { session });
    
    const paymentId = payment[0]._id;
    const referenceNumber = payment[0].referenceNumber;
    
    // Get the latest supplier ledger entry to find current balance
    const lastLedgerEntry = await SupplierLedger.findOne(
      { supplierId: paymentData.supplierId },
      {},
      { sort: { transactionDate: -1 } }
    ).lean() as ISupplierLedgerDocument | null;
    
    const previousBalance = lastLedgerEntry && lastLedgerEntry.balance !== undefined ? lastLedgerEntry.balance : 0;
    const newBalance = previousBalance - paymentData.amount;
    
    // Create ledger entry
    await SupplierLedger.create([{
      supplierId: paymentData.supplierId,
      transactionDate: paymentData.paymentDate || new Date(),
      transactionType: 'payment',
      referenceId: paymentId,
      referenceNumber: referenceNumber,
      debit: paymentData.amount,
      credit: 0,
      balance: newBalance,
      notes: paymentData.notes
    }], { session });
    
    // If specific purchase orders are referenced, we can update their payment status
    if (paymentData.referenceIds && paymentData.referenceIds.length > 0) {
      for (const orderId of paymentData.referenceIds) {
        const order = await PurchaseOrder.findById(orderId);
        if (order) {
          // Check if the payment completes the order payment
          if (order.totalAmount <= paymentData.amount) {
            order.paymentStatus = 'paid';
          } else {
            order.paymentStatus = 'partial';
          }
          await order.save({ session });
        }
      }
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    return payment[0];
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get customer account statement with all ledger entries
 */
export const getCustomerAccountStatement = async (
  customerId: string,
  startDate?: Date,
  endDate?: Date
) => {
  await connectDB();
  
  // Build filter
  const filter: any = { customerId };
  
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = startDate;
    if (endDate) filter.transactionDate.$lte = endDate;
  }
  
  // Get customer details
  let customer: ICustomerDocument;
  if (customerId === 'walk-in') {
    customer = {
      _id: 'walk-in',
      name: 'Walk-in Customer',
      email: '',
      phone: '',
      address: ''
    };
  } else {
    const customerDoc = await Customer.findById(customerId).lean();
    if (!customerDoc) {
      throw new Error('Customer not found');
    }
    customer = customerDoc as unknown as ICustomerDocument;
  }
  
  // Get ledger entries
  const ledgerEntries = await CustomerLedger.find(filter)
    .sort({ transactionDate: 1 })
    .lean() as ICustomerLedgerDocument[];
  
  // Get current balance
  const lastEntry = await CustomerLedger.findOne({ customerId })
    .sort({ transactionDate: -1 })
    .lean() as ICustomerLedgerDocument | null;
  
  const currentBalance = lastEntry && lastEntry.balance !== undefined ? lastEntry.balance : 0;
  
  return {
    customer,
    ledgerEntries,
    summary: {
      totalDebit: ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0),
      totalCredit: ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0),
      currentBalance
    }
  };
};

/**
 * Get supplier account statement with all ledger entries
 */
export const getSupplierAccountStatement = async (
  supplierId: string,
  startDate?: Date,
  endDate?: Date
) => {
  await connectDB();
  
  // Build filter
  const filter: any = { supplierId };
  
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = startDate;
    if (endDate) filter.transactionDate.$lte = endDate;
  }
  
  // Get supplier details
  const supplierDoc = await Supplier.findById(supplierId).lean();
  if (!supplierDoc) {
    throw new Error('Supplier not found');
  }
  const supplier = supplierDoc as unknown as ISupplierDocument;
  
  // Get ledger entries
  const ledgerEntries = await SupplierLedger.find(filter)
    .sort({ transactionDate: 1 })
    .lean() as ISupplierLedgerDocument[];
  
  // Get current balance
  const lastEntry = await SupplierLedger.findOne({ supplierId })
    .sort({ transactionDate: -1 })
    .lean() as ISupplierLedgerDocument | null;
  
  const currentBalance = lastEntry && lastEntry.balance !== undefined ? lastEntry.balance : 0;
  
  return {
    supplier,
    ledgerEntries,
    summary: {
      totalDebit: ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0),
      totalCredit: ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0),
      currentBalance
    }
  };
};

/**
 * Get all payments (filterable by type, date range, entity)
 */
export const getPayments = async (filters: {
  transactionType?: 'customer-payment' | 'supplier-payment';
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  await connectDB();
  
  const { 
    transactionType, 
    entityId, 
    startDate, 
    endDate,
    page = 1,
    limit = 10
  } = filters;
  
  // Build filter
  const filter: any = {};
  
  if (transactionType) {
    filter.transactionType = transactionType;
  }
  
  if (entityId) {
    filter.entityId = entityId;
  }
  
  if (startDate || endDate) {
    filter.paymentDate = {};
    if (startDate) filter.paymentDate.$gte = startDate;
    if (endDate) filter.paymentDate.$lte = endDate;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Get payments
  const payments = await Payment.find(filter)
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean() as IPaymentDocument[];
  
  // Get total count
  const totalCount = await Payment.countDocuments(filter);
  
  return {
    payments,
    pagination: {
      total: totalCount,
      page,
      pages: Math.ceil(totalCount / limit),
      limit
    }
  };
};

/**
 * Get outstanding balances for all customers
 */
export const getCustomerBalances = async () => {
  await connectDB();
  
  // Get the latest balance for each customer
  const balances = await CustomerLedger.aggregate([
    {
      $sort: { customerId: 1, transactionDate: -1 }
    },
    {
      $group: {
        _id: "$customerId",
        lastTransaction: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$lastTransaction" }
    },
    {
      $match: {
        balance: { $ne: 0 } // Only include customers with non-zero balances
      }
    },
    {
      $project: {
        customerId: 1,
        balance: 1,
        transactionDate: 1
      }
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerDetails"
      }
    },
    {
      $unwind: {
        path: "$customerDetails",
        preserveNullAndEmptyArrays: true // Keep walk-in customers
      }
    },
    {
      $project: {
        customerId: 1,
        balance: 1,
        transactionDate: 1,
        customerName: { $ifNull: ["$customerDetails.name", "Walk-in Customer"] },
        phone: { $ifNull: ["$customerDetails.phone", ""] }
      }
    },
    {
      $sort: { balance: -1 } // Sort by balance descending
    }
  ]);
  
  return balances;
};

/**
 * Get outstanding balances for all suppliers
 */
export const getSupplierBalances = async () => {
  await connectDB();
  
  // Get the latest balance for each supplier
  const balances = await SupplierLedger.aggregate([
    {
      $sort: { supplierId: 1, transactionDate: -1 }
    },
    {
      $group: {
        _id: "$supplierId",
        lastTransaction: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$lastTransaction" }
    },
    {
      $match: {
        balance: { $ne: 0 } // Only include suppliers with non-zero balances
      }
    },
    {
      $project: {
        supplierId: 1,
        balance: 1,
        transactionDate: 1
      }
    },
    {
      $lookup: {
        from: "suppliers",
        localField: "supplierId",
        foreignField: "_id",
        as: "supplierDetails"
      }
    },
    {
      $unwind: {
        path: "$supplierDetails"
      }
    },
    {
      $project: {
        supplierId: 1,
        balance: 1,
        transactionDate: 1,
        supplierName: "$supplierDetails.name",
        contactPerson: "$supplierDetails.contactPerson",
        phone: "$supplierDetails.phone"
      }
    },
    {
      $sort: { balance: -1 } // Sort by balance descending
    }
  ]);
  
  return balances;
};

/**
 * Record a manual adjustment to a customer ledger
 */
export const recordCustomerAdjustment = async (adjustmentData: {
  customerId: string;
  amount: number; // Positive to increase customer debt, negative to decrease
  notes: string;
  adjustmentDate?: Date;
}) => {
  await connectDB();
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { customerId, amount, notes, adjustmentDate } = adjustmentData;
    const transactionDate = adjustmentDate || new Date();
    
    // Determine if this is a debit or credit adjustment
    const isDebit = amount > 0;
    const absoluteAmount = Math.abs(amount);
    
    // Get the latest customer ledger entry to find current balance
    const lastLedgerEntry = await CustomerLedger.findOne(
      { customerId },
      {},
      { sort: { transactionDate: -1 } }
    ).lean() as ICustomerLedgerDocument | null;
    
    const previousBalance = lastLedgerEntry && lastLedgerEntry.balance !== undefined ? lastLedgerEntry.balance : 0;
    const newBalance = previousBalance + amount;
    
    // Create ledger entry
    const adjustment = await CustomerLedger.create([{
      customerId,
      transactionDate,
      transactionType: 'adjustment',
      referenceId: new mongoose.Types.ObjectId(), // Generate a new ID for this adjustment
      referenceNumber: `ADJ-${Date.now()}`,
      debit: isDebit ? absoluteAmount : 0,
      credit: isDebit ? 0 : absoluteAmount,
      balance: newBalance,
      notes
    }], { session });
    
    await session.commitTransaction();
    session.endSession();
    
    return adjustment[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Record a manual adjustment to a supplier ledger
 */
export const recordSupplierAdjustment = async (adjustmentData: {
  supplierId: string;
  amount: number; // Positive to increase what you owe, negative to decrease
  notes: string;
  adjustmentDate?: Date;
}) => {
  await connectDB();
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { supplierId, amount, notes, adjustmentDate } = adjustmentData;
    const transactionDate = adjustmentDate || new Date();
    
    // Determine if this is a debit or credit adjustment
    const isCredit = amount > 0;
    const absoluteAmount = Math.abs(amount);
    
    // Get the latest supplier ledger entry to find current balance
    const lastLedgerEntry = await SupplierLedger.findOne(
      { supplierId },
      {},
      { sort: { transactionDate: -1 } }
    ).lean() as ISupplierLedgerDocument | null;
    
    const previousBalance = lastLedgerEntry && lastLedgerEntry.balance !== undefined ? lastLedgerEntry.balance : 0;
    const newBalance = previousBalance + amount;
    
    // Create ledger entry
    const adjustment = await SupplierLedger.create([{
      supplierId,
      transactionDate,
      transactionType: 'adjustment',
      referenceId: new mongoose.Types.ObjectId(), // Generate a new ID for this adjustment
      referenceNumber: `ADJ-${Date.now()}`,
      debit: isCredit ? 0 : absoluteAmount,
      credit: isCredit ? absoluteAmount : 0,
      balance: newBalance,
      notes
    }], { session });
    
    await session.commitTransaction();
    session.endSession();
    
    return adjustment[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get financial overview statistics
 */
export const getFinancialOverview = async () => {
  await connectDB();
  
  // Get total accounts receivable (customer balances)
  const customerBalances = await CustomerLedger.aggregate([
    {
      $sort: { customerId: 1, transactionDate: -1 }
    },
    {
      $group: {
        _id: "$customerId",
        lastTransaction: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$lastTransaction" }
    },
    {
      $group: {
        _id: null,
        totalReceivable: { $sum: "$balance" }
      }
    }
  ]);
  
  // Get total accounts payable (supplier balances)
  const supplierBalances = await SupplierLedger.aggregate([
    {
      $sort: { supplierId: 1, transactionDate: -1 }
    },
    {
      $group: {
        _id: "$supplierId",
        lastTransaction: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$lastTransaction" }
    },
    {
      $group: {
        _id: null,
        totalPayable: { $sum: "$balance" }
      }
    }
  ]);
  
  // Get payments this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  const paymentsThisMonth = await Payment.aggregate([
    {
      $match: {
        paymentDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }
    },
    {
      $group: {
        _id: "$transactionType",
        total: { $sum: "$amount" }
      }
    }
  ]);
  
  // Format the results
  const totalReceivable = customerBalances.length > 0 ? customerBalances[0].totalReceivable : 0;
  const totalPayable = supplierBalances.length > 0 ? supplierBalances[0].totalPayable : 0;
  
  const customerPaymentsThisMonth = paymentsThisMonth.find(p => p._id === 'customer-payment');
  const supplierPaymentsThisMonth = paymentsThisMonth.find(p => p._id === 'supplier-payment');
  
  return {
    totalReceivable,
    totalPayable,
    monthlyCustomerPayments: customerPaymentsThisMonth ? customerPaymentsThisMonth.total : 0,
    monthlySupplierPayments: supplierPaymentsThisMonth ? supplierPaymentsThisMonth.total : 0
  };
};