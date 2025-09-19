import mongoose, { Document, Schema } from 'mongoose';
import { ISupplier } from './Supplier';

export interface ISupplierLedger extends Document {
  supplierId: mongoose.Types.ObjectId;
  transactionType: string; // purchase, payment
  debit: number; // Amount you owe supplier decreases
  credit: number; // Amount you owe supplier increases
  balance: number; // The running balance after this transaction
  referenceId: mongoose.Types.ObjectId; // e.g., purchaseOrderId or paymentId
  createdAt: Date;
}

const supplierLedgerSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'payment'],
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
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: true
});

supplierLedgerSchema.index({ supplierId: 1, createdAt: 1 });
supplierLedgerSchema.index({ referenceId: 1 });

const SupplierLedger = mongoose.model<ISupplierLedger>('SupplierLedger', supplierLedgerSchema);

export default SupplierLedger;