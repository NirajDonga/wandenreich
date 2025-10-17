import mongoose, { Schema, Document } from 'mongoose';

export interface ITax extends Document {
  userId: string;
  name: string;
  rate: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaxSchema = new Schema<ITax>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
TaxSchema.index({ userId: 1, rate: 1 });

export default mongoose.models.Tax || mongoose.model<ITax>('Tax', TaxSchema);
