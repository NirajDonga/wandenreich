import mongoose, { Schema, models } from 'mongoose';

const PurchaseOrderSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  referenceNumber: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate reference number
PurchaseOrderSchema.pre('save', async function(next) {
  if (!this.referenceNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.referenceNumber = `PO-${Date.now()}-${count + 1}`;
  }
  next();
});

const PurchaseOrder = models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);

export default PurchaseOrder;
