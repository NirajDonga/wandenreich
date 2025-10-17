import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
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
CategorySchema.index({ userId: 1, name: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
