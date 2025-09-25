import mongoose, { Document, Schema } from 'mongoose';

export interface IUnitOfMeasure extends Document {
  name: string;
  abbreviation: string;
}

const unitOfMeasureSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  abbreviation: {
    type: String,
    required: true,
    trim: true
  }
});

const UnitOfMeasure = mongoose.models.UnitOfMeasure || mongoose.model<IUnitOfMeasure>('UnitOfMeasure', unitOfMeasureSchema);

export default UnitOfMeasure;