import mongoose, { Document, Schema } from 'mongoose';
import { ISupplier } from './Supplier';

export interface ISupplierPayment extends Document {
  supplierId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  method: string;
  notes: string;
}

const supplierPaymentSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
});

supplierPaymentSchema.index({ supplierId: 1 });
supplierPaymentSchema.index({ paymentDate: 1 });

const SupplierPayment = mongoose.model<ISupplierPayment>('SupplierPayment', supplierPaymentSchema);

export default SupplierPayment;