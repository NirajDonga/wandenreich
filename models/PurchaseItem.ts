import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseItem extends Document {
  purchaseOrderId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number; // Cost per unit for this specific purchase
  receivedQuantity: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema({
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
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  receivedQuantity: {
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

purchaseItemSchema.index({ purchaseOrderId: 1 });
purchaseItemSchema.index({ productVariantId: 1 });

const PurchaseItem = mongoose.models.PurchaseItem || 
  mongoose.model<IPurchaseItem>('PurchaseItem', purchaseItemSchema);

export default PurchaseItem;