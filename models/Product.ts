import mongoose, { Document, Schema } from 'mongoose';
import { IUnitOfMeasure } from './UnitOfMeasure';

export interface IProduct extends Document {
  name: string;
  sku: string;
  unitOfMeasureId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  unitOfMeasureId: {
    type: Schema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    required: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;