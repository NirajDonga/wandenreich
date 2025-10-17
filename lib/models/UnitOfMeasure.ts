import mongoose, { Schema, models } from 'mongoose';

const UnitOfMeasureSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  abbreviation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UnitOfMeasure = models.UnitOfMeasure || mongoose.model('UnitOfMeasure', UnitOfMeasureSchema);

export default UnitOfMeasure;
