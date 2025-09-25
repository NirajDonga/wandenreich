import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from './Customer';

export interface ISalesOrder extends Document {
  customerId: mongoose.Types.ObjectId | 'walk-in';
  invoiceNumber: string;
  orderDate: Date;
  status: string; // completed, pending, cancelled
  totalAmount: number;
  discount: number;
  taxAmount: number;
  netAmount: number;
  paymentMethod: string; // cash, credit, bank-transfer, online, other
  paymentStatus: string; // paid, partial, unpaid
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const salesOrderSchema = new Schema({
  customerId: {
    type: Schema.Types.Mixed, // Can be ObjectId or 'walk-in' string
    required: true,
    ref: 'Customer'
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'bank-transfer', 'online', 'other'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'paid'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

salesOrderSchema.index({ customerId: 1 });
salesOrderSchema.index({ orderDate: -1 });
salesOrderSchema.index({ paymentStatus: 1 });
salesOrderSchema.index({ status: 1 });

const SalesOrder = mongoose.models.SalesOrder || 
  mongoose.model<ISalesOrder>('SalesOrder', salesOrderSchema);

export default SalesOrder;