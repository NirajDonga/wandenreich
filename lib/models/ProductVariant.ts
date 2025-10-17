import mongoose, { Schema, models } from 'mongoose';

const ProductVariantSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  attributes: {
    type: Schema.Types.Mixed,
    default: {},
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ProductVariantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ProductVariant = models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);

export default ProductVariant;
