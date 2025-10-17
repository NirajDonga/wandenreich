import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  taxType?: 'none' | 'gst' | 'igst';
  taxRate?: number;
  taxAmount?: number;
  totalCost: number;
}

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  items: IPurchaseItem[];
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  invoiceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductSimple',
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
  taxType: {
    type: String,
    enum: ['none', 'gst', 'igst'],
    default: 'none'
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  }
});

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    items: {
      type: [PurchaseItemSchema],
      required: true,
      validate: {
        validator: function(items: IPurchaseItem[]) {
          return items.length > 0;
        },
        message: 'At least one item is required'
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    balanceDue: {
      type: Number,
      required: true,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'credit'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid'
    },
    invoiceNumber: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
PurchaseSchema.index({ userId: 1, createdAt: -1 });
PurchaseSchema.index({ supplierId: 1, createdAt: -1 });
PurchaseSchema.index({ paymentStatus: 1 });

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);
