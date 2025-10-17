import mongoose, { Schema, models } from 'mongoose';

const CustomerPaymentSchema = new Schema({
  salesOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrder',
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
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

const CustomerPayment = models.CustomerPayment || mongoose.model('CustomerPayment', CustomerPaymentSchema);

export default CustomerPayment;
