import mongoose, { Document, Schema } from 'mongoose';
import { ISupplier } from './Supplier';

export interface ISupplierLedger extends Document {
  supplierId: mongoose.Types.ObjectId;
  transactionDate: Date;
  transactionType: 'purchase' | 'payment' | 'return' | 'adjustment';
  referenceId: mongoose.Types.ObjectId; // e.g., purchaseOrderId or paymentId
  referenceNumber: string; // Purchase order number or payment reference
  debit: number; // Amount you owe supplier decreases (payments)
  credit: number; // Amount you owe supplier increases (purchases)
  balance: number; // The running balance after this transaction
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierLedgerSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'payment', 'return', 'adjustment'],
    required: true
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true
    // No explicit ref - could be a purchase order or payment
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
supplierLedgerSchema.index({ supplierId: 1, transactionDate: -1 });
supplierLedgerSchema.index({ supplierId: 1, balance: 1 });
supplierLedgerSchema.index({ transactionDate: -1 });
supplierLedgerSchema.index({ referenceId: 1 });
supplierLedgerSchema.index({ referenceNumber: 1 });

const SupplierLedger = mongoose.models.SupplierLedger || 
  mongoose.model<ISupplierLedger>('SupplierLedger', supplierLedgerSchema);

export default SupplierLedger;