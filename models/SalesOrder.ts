import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from './Customer';

export interface ISalesOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  orderDate: Date;
  status: string; // completed, pending, cancelled
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const salesOrderSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
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
  }
}, {
  timestamps: true
});

const SalesOrder = mongoose.model<ISalesOrder>('SalesOrder', salesOrderSchema);

export default SalesOrder;