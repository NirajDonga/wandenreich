import mongoose, { Schema, models } from 'mongoose';

const SalesOrderItemSchema = new Schema({
  salesOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrder',
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
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Calculate total price before saving
SalesOrderItemSchema.pre('save', function(next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

const SalesOrderItem = models.SalesOrderItem || mongoose.model('SalesOrderItem', SalesOrderItemSchema);

export default SalesOrderItem;
