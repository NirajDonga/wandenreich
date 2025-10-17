import mongoose, { Schema, models } from 'mongoose';

const SupplierPaymentSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ['cash', 'card', 'online', 'cheque', 'upi', 'bank_transfer'],
    required: true,
  },
  referenceNumber: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SupplierPayment = models.SupplierPayment || mongoose.model('SupplierPayment', SupplierPaymentSchema);

export default SupplierPayment;
