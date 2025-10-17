import mongoose, { Schema, models } from 'mongoose';

const SupplierSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  contactName: String,
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: String,
  address: String,
  gstin: {
    type: String,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GSTIN format'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Supplier = models.Supplier || mongoose.model('Supplier', SupplierSchema);

export default Supplier;
