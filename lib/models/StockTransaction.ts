import mongoose, { Schema, models } from 'mongoose';

const StockTransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductSimple',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'sale', 'return_purchase', 'return_sale', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number, // Cost at which item was purchased (for profit calculation)
    default: 0
  },
  unitPrice: {
    type: Number, // Price at which item was sold
    default: 0
  },
  referenceId: {
    type: Schema.Types.ObjectId, // Links to Purchase or Sale
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Purchase', 'Sale', null]
  },
  notes: {
    type: String,
    trim: true
  },
  balanceAfter: {
    type: Number, // Stock balance after this transaction
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
StockTransactionSchema.index({ userId: 1, productId: 1, createdAt: -1 });

export default models.StockTransaction || mongoose.model('StockTransaction', StockTransactionSchema);
