import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  transactionType: 'customer-payment' | 'supplier-payment';
  entityId: mongoose.Types.ObjectId | string; // Customer or Supplier ID
  referenceIds?: mongoose.Types.ObjectId[] | string[]; // Optional links to orders this payment applies to
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema({
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'bank-transfer', 'online', 'check', 'credit-card', 'upi', 'other']
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['customer-payment', 'supplier-payment']
  },
  entityId: {
    type: Schema.Types.Mixed, // Can be ObjectId or 'walk-in' for customer payments
    required: true,
    // No explicit ref - we'll determine based on transactionType
  },
  referenceIds: [{
    type: Schema.Types.ObjectId,
    // No explicit ref - could be sales order or purchase order
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ transactionType: 1 });
paymentSchema.index({ entityId: 1, transactionType: 1 });
paymentSchema.index({ referenceIds: 1 });

const Payment = mongoose.models.Payment || 
  mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;