import mongoose, { Document, Schema } from 'mongoose';
import { IPurchaseOrder } from './PurchaseOrder';
import { IProductVariant } from './ProductVariant';

export interface IPurchaseOrderItem extends Document {
  purchaseOrderId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

const purchaseOrderItemSchema = new Schema({
  purchaseOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
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
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  }
});

const PurchaseOrderItem = mongoose.models.PurchaseOrderItem || mongoose.model<IPurchaseOrderItem>('PurchaseOrderItem', purchaseOrderItemSchema);

export default PurchaseOrderItem;