import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from './Customer';

export interface ICustomerLedger extends Document {
  customerId: mongoose.Types.ObjectId;
  transactionType: string; // sale, payment, refund
  debit: number; // Amount customer owes you increases
  credit: number; // Amount customer owes you decreases
  balance: number; // The running balance after this transaction
  referenceId: mongoose.Types.ObjectId; // e.g., salesOrderId or paymentId
  createdAt: Date;
}

const customerLedgerSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['sale', 'payment', 'refund'],
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

customerLedgerSchema.index({ customerId: 1, createdAt: 1 });
customerLedgerSchema.index({ referenceId: 1 });

const CustomerLedger = mongoose.model<ICustomerLedger>('CustomerLedger', customerLedgerSchema);

export default CustomerLedger;