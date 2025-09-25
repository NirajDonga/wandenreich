import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product';

export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  name: string;
  attributes: Record<string, any>;  // Dynamic attributes (color, size, etc.)
  sku: string;
  sellingPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {}
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Only create indexes if the model doesn't exist yet
if (!mongoose.models.ProductVariant) {
  productVariantSchema.index({ productId: 1 });
  // SKU index is already created by unique: true in schema, no need to duplicate
  productVariantSchema.index({ sellingPrice: 1 });
}

// Use the existing model if it exists, otherwise create a new one
const ProductVariant = mongoose.models.ProductVariant || mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);

export default ProductVariant;