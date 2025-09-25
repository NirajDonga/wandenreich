import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

const supplierSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

supplierSchema.index({ name: 1 });

const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;