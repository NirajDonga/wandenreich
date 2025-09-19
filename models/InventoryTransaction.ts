import mongoose, { Document, Schema } from 'mongoose';
import { IProductVariant } from './ProductVariant';

export interface IInventoryTransaction extends Document {
  productVariantId: mongoose.Types.ObjectId;
  transactionType: string; // purchase, sale, return, adjustment
  quantity: number;
  purchaseOrderItemId?: mongoose.Types.ObjectId;
  salesOrderItemId?: mongoose.Types.ObjectId;
  notes: string;
  createdAt: Date;
}

const inventoryTransactionSchema = new Schema({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  purchaseOrderItemId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrderItem'
  },
  salesOrderItemId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrderItem'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;