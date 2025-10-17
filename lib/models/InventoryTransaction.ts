import mongoose, { Schema, models } from 'mongoose';

const InventoryTransactionSchema = new Schema({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  purchaseOrderItemId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrderItem',
  },
  salesOrderItemId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrderItem',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InventoryTransaction = models.InventoryTransaction || mongoose.model('InventoryTransaction', InventoryTransactionSchema);

export default InventoryTransaction;
