import mongoose, { Schema, models } from 'mongoose';

const InventorySchema = new Schema({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  minStockLevel: {
    type: Number,
    default: 0,
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

InventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Inventory = models.Inventory || mongoose.model('Inventory', InventorySchema);

export default Inventory;
