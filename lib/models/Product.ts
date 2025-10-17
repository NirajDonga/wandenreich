import mongoose, { Schema, models } from 'mongoose';

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  unitOfMeasureId: {
    type: Schema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    required: true,
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

ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Product = models.Product || mongoose.model('Product', ProductSchema);

export default Product;
