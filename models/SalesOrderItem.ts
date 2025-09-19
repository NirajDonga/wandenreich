import mongoose, { Document, Schema } from 'mongoose';
import { ISalesOrder } from './SalesOrder';
import { IProductVariant } from './ProductVariant';

// Line items within a sales order
export interface ISalesOrderItem extends Document {
  salesOrderId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

const salesOrderItemSchema = new Schema({
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
    min: 0.01
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

salesOrderItemSchema.index({ salesOrderId: 1 });
salesOrderItemSchema.index({ productVariantId: 1 });

const SalesOrderItem = mongoose.model<ISalesOrderItem>('SalesOrderItem', salesOrderItemSchema);

export default SalesOrderItem;