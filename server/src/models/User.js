import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  id: { type: String, default: () => `addr-${Date.now()}` },
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, default: 17.4480 },
  lng: { type: Number, default: 78.3910 },
  isDefault: { type: Boolean, default: false },
});

// Dedicated Sub-Profiles
const customerProfileSchema = new mongoose.Schema(
  {
    full_name: { type: String, trim: true },
    phone: { type: String, trim: true },
    addresses: [addressSchema],
  },
  { _id: false }
);

const merchantProfileSchema = new mongoose.Schema(
  {
    business_name: { type: String, trim: true },
    category: {
      type: String,
      enum: ['Food', 'Kirana', 'Pharmacy', 'Bakery', 'Flowers', 'Electronics', 'Services', 'food', 'grocery', 'pharmacy', 'bakery', 'flowers', 'electronics'],
      default: 'Food',
    },
    fssai_license: { type: String, trim: true },
    pan_number: { type: String, trim: true, uppercase: true },
    bank_details: {
      upiId: { type: String, trim: true },
      accountNo: { type: String, trim: true },
      ifsc: { type: String, trim: true, uppercase: true },
      bankName: { type: String, trim: true },
    },
    store_address: {
      street: { type: String, trim: true },
      locality: { type: String, trim: true },
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    geo_point: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [78.3910, 17.4480], // [lng, lat]
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { _id: false }
);

const riderProfileSchema = new mongoose.Schema(
  {
    full_name: { type: String, trim: true },
    phone: { type: String, trim: true },
    vehicle_type: {
      type: String,
      enum: ['motorcycle', 'scooter', 'ev', 'bicycle', 'MOTORCYCLE', 'SCOOTER', 'EV', 'BICYCLE'],
      default: 'motorcycle',
    },
    vehicle_number: { type: String, trim: true, uppercase: true },
    driving_license_no: { type: String, trim: true, uppercase: true },
    license_doc_url: { type: String, trim: true },
    duty_status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'OFFLINE',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
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
      required: true,
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN', 'customer', 'merchant', 'rider', 'admin'],
      default: 'CUSTOMER',
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'rejected', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED'],
      default: 'active',
      index: true,
    },
    // Distinct Role Profiles
    customer_profile: customerProfileSchema,
    merchant_profile: merchantProfileSchema,
    rider_profile: riderProfileSchema,

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
    language: { type: String, enum: ['en', 'te'], default: 'en' },
    merchantId: { type: String, index: true },
    riderId: { type: String, index: true },
    addresses: [addressSchema],
    favorites: [{ type: String }],
    savedPosts: [{ type: String }],
    settings: {
      orderNotifications: { type: Boolean, default: true },
      promoNotifications: { type: Boolean, default: true },
      restockAlerts: { type: Boolean, default: true },
      recurringReminders: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias for full_name
userSchema.virtual('full_name').get(function () {
  return this.name;
});

// Password hashing middleware with double-hash safeguard
userSchema.pre('save', async function (next) {
  // Normalize role to uppercase canonical
  if (this.role) {
    this.role = this.role.toUpperCase();
  }

  // Sync sub-profiles if needed
  if (this.role === 'CUSTOMER' && !this.customer_profile) {
    this.customer_profile = {
      full_name: this.name,
      phone: this.phone,
      addresses: this.addresses || [],
    };
  }

  if (!this.isModified('password') || !this.password) return next();
  
  // Safeguard: Check if string is already a standard 60-character bcrypt hash
  if (/^\$2[aby]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
