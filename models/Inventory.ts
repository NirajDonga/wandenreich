import mongoose, { Document, Schema } from 'mongoose';
import { IProductVariant } from './ProductVariant';

export interface IInventory extends Document {
  productVariantId: mongoose.Types.ObjectId;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastUpdated: Date;
}

const inventorySchema = new Schema({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 0
  },
  maxStockLevel: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);

export default Inventory;