import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
}

export interface ISale extends Document {
  userId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId | null;
  items: ISaleItem[];
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema({
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
  sellingPrice: {
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

const SaleSchema = new Schema<ISale>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: {
        validator: function(items: ISaleItem[]) {
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
SaleSchema.index({ userId: 1, createdAt: -1 });
SaleSchema.index({ customerId: 1, createdAt: -1 });
SaleSchema.index({ paymentStatus: 1 });

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
