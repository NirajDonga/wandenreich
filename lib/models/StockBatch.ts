import mongoose, { Schema, Document } from 'mongoose';

export interface IStockBatch extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  purchaseId: mongoose.Types.ObjectId;
  quantity: number; // Remaining quantity in this batch
  originalQuantity: number; // Original quantity purchased
  unitCost: number; // Purchase price per unit
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockBatchSchema = new Schema<IStockBatch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductSimple',
      required: true,
      index: true
    },
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    originalQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    purchaseDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for FIFO queries (oldest first)
StockBatchSchema.index({ userId: 1, productId: 1, purchaseDate: 1 });

export default mongoose.models.StockBatch || mongoose.model<IStockBatch>('StockBatch', StockBatchSchema);
