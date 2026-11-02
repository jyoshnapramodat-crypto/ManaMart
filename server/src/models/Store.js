import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['food', 'grocery', 'kirana', 'pharmacy', 'bakery', 'flowers', 'stationery', 'electronics', 'services'],
      required: true,
      index: true,
    },
    subCategories: [{ type: String }],
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    eta: { type: String, default: '⚡ 15-20 MINS' },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    isRestaurant: { type: Boolean, default: false },
    hasTableBooking: { type: Boolean, default: false },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    },
    address: {
      street: { type: String, required: true },
      locality: { type: String, required: true, index: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [78.3910, 17.4480] }, // [lng, lat]
      },
    },
    openingHours: {
      openTime: { type: String, default: '08:00 AM' },
      closeTime: { type: String, default: '10:30 PM' },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['open', 'busy', 'closed'],
      default: 'open',
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    fssaiLicense: { type: String },
    drugLicense: { type: String },
    tradeLicense: { type: String },
    activeOffers: [
      {
        code: { type: String },
        description: { type: String },
        discountPercentage: { type: Number },
        minOrder: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

storeSchema.index({ 'address.location': '2dsphere' });

export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
export default Store;
