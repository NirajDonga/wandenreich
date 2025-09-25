import mongoose, { Document, Schema } from 'mongoose';

export interface ISalesItem extends Document {
  salesOrderId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number; // The actual selling price for this specific sale
  regularPrice: number; // The default/regular price
  discount: number; // Discount amount per unit
  subtotal: number; // (unitPrice * quantity)
  createdAt: Date;
  updatedAt: Date;
}

const salesItemSchema = new Schema({
  salesOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: true
  },
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  regularPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

salesItemSchema.index({ salesOrderId: 1 });
salesItemSchema.index({ productVariantId: 1 });

const SalesItem = mongoose.models.SalesItem || 
  mongoose.model<ISalesItem>('SalesItem', salesItemSchema);

export default SalesItem;