import mongoose, { Schema, models } from 'mongoose';

const SalesOrderSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate invoice number
SalesOrderSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('SalesOrder').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  this.updatedAt = new Date();
  next();
});

const SalesOrder = models.SalesOrder || mongoose.model('SalesOrder', SalesOrderSchema);

export default SalesOrder;
