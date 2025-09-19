import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from './Customer';
import { ISalesOrder } from './SalesOrder';

export interface ICustomerPayment extends Document {
  salesOrderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  method: string; // cash, card, online
}

const customerPaymentSchema = new Schema({
  salesOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
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
    enum: ['cash', 'card', 'online'],
    required: true
  }
});

customerPaymentSchema.index({ salesOrderId: 1 });
customerPaymentSchema.index({ customerId: 1 });
customerPaymentSchema.index({ paymentDate: 1 });

const CustomerPayment = mongoose.model<ICustomerPayment>('CustomerPayment', customerPaymentSchema);

export default CustomerPayment;