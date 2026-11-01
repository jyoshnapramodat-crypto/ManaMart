import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, default: 17.4480 },
  lng: { type: Number, default: 78.3910 },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: false, // Optional for pure OTP logins, required for password auth
    },
    role: {
      type: String,
      enum: ['customer', 'merchant', 'rider', 'admin'],
      default: 'customer',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'rejected'],
      default: 'active',
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    language: { type: String, enum: ['en', 'te'], default: 'en' },
    merchantId: { type: String },
    riderId: { type: String },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
