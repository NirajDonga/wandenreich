import mongoose, { Schema, models } from 'mongoose';

const CustomerLedgerSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['sale', 'payment', 'refund'],
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
    enum: ['SalesOrder', 'CustomerPayment'],
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
CustomerLedgerSchema.index({ customerId: 1, createdAt: -1 });

const CustomerLedger = models.CustomerLedger || mongoose.model('CustomerLedger', CustomerLedgerSchema);

export default CustomerLedger;
