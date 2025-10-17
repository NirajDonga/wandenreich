import mongoose, { Schema, models } from 'mongoose';

const PurchaseOrderItemSchema = new Schema({
  purchaseOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true,
  },
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Calculate total cost before saving
PurchaseOrderItemSchema.pre('save', function(next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

const PurchaseOrderItem = models.PurchaseOrderItem || mongoose.model('PurchaseOrderItem', PurchaseOrderItemSchema);

export default PurchaseOrderItem;
