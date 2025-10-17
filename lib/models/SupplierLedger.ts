import mongoose, { Schema, models } from 'mongoose';

const SupplierLedgerSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'payment'],
    required: true,
  },
  debit: {
    type: Number,
    default: 0,
    min: 0,
  },
  credit: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  referenceModel: {
    type: String,
    enum: ['PurchaseOrder', 'SupplierPayment'],
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
SupplierLedgerSchema.index({ supplierId: 1, createdAt: -1 });

const SupplierLedger = models.SupplierLedger || mongoose.model('SupplierLedger', SupplierLedgerSchema);

export default SupplierLedger;
