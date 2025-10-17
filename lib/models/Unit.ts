import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  userId: string;
  name: string;
  symbol: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
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
    symbol: {
      type: String,
      required: true,
      trim: true
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
UnitSchema.index({ userId: 1, name: 1 });

export default mongoose.models.Unit || mongoose.model<IUnit>('Unit', UnitSchema);
