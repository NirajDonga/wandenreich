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

productVariantSchema.index({ productId: 1 });
productVariantSchema.index({ sku: 1 }, { unique: true });
productVariantSchema.index({ sellingPrice: 1 });

const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);

export default ProductVariant;