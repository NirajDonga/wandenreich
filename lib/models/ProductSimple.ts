import mongoose, { Schema, models } from 'mongoose';

const ProductSimpleSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  unitOfMeasure: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
ProductSimpleSchema.index({ userId: 1, name: 1 });

export default models.ProductSimple || mongoose.model('ProductSimple', ProductSimpleSchema);
