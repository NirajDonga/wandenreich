import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from './Customer';

export interface ICustomerLedger extends Document {
  customerId: mongoose.Types.ObjectId | 'walk-in';
  transactionDate: Date;
  transactionType: 'sale' | 'payment' | 'refund' | 'adjustment';
  referenceId: mongoose.Types.ObjectId; // e.g., salesOrderId or paymentId
  referenceNumber: string; // Invoice number or payment reference
  debit: number; // Amount customer owes you increases
  credit: number; // Amount customer owes you decreases
  balance: number; // The running balance after this transaction
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerLedgerSchema = new Schema({
  customerId: {
    type: Schema.Types.Mixed, // Can be ObjectId or 'walk-in' string
    required: true,
    ref: 'Customer'
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  transactionType: {
    type: String,
    enum: ['sale', 'payment', 'refund', 'adjustment'],
    required: true
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true
    // No explicit ref - could be a sales order or payment
  },
  referenceNumber: {
    type: String,
    required: true
  },
  debit: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries and reporting
customerLedgerSchema.index({ customerId: 1, transactionDate: -1 });
customerLedgerSchema.index({ customerId: 1, balance: 1 });
customerLedgerSchema.index({ transactionDate: -1 });
customerLedgerSchema.index({ referenceId: 1 });
customerLedgerSchema.index({ referenceNumber: 1 });

const CustomerLedger = mongoose.models.CustomerLedger || 
  mongoose.model<ICustomerLedger>('CustomerLedger', customerLedgerSchema);

export default CustomerLedger;