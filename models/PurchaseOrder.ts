import mongoose, { Document, Schema } from 'mongoose';
import { ISupplier } from './Supplier';

export interface IPurchaseOrder extends Document {
  supplierId: mongoose.Types.ObjectId;
  orderDate: Date;
  status: string; // pending, received, cancelled
  totalAmount: number;
  referenceNumber: string;
  paymentStatus: string; // unpaid, partial, paid
  createdAt: Date;
}

const purchaseOrderSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  referenceNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;