import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  image: String,
  gstin: {
    type: String,
    required: false,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // GSTIN format: 2 digits (state) + 10 alphanumeric (PAN) + 1 digit (entity) + 1 alphanumeric (default Z) + 1 check digit
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GSTIN format'
    }
  },
  businessName: String,
  businessAddress: String,
  phone: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = models.User || mongoose.model('User', UserSchema);

export default User;
