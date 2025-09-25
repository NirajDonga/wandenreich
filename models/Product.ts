import mongoose, { Document, Schema } from 'mongoose';
import { IUnitOfMeasure } from './UnitOfMeasure';

export interface IProduct extends Document {
  name: string;
  sku?: string;
  brand?: string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  barcode?: string;
  minStockLevel: number;
  isActive: boolean;
  unitOfMeasure: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  brand: {
    type: String,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  barcode: {
    type: String,
    trim: true
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unitOfMeasure: {
    type: Schema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    required: true
  }
}, {
  timestamps: true
});

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;