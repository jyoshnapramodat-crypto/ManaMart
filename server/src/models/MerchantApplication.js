import mongoose from 'mongoose';

const merchantApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    category: {
      type: String,
      enum: ['food', 'grocery', 'kirana', 'pharmacy', 'bakery', 'flowers', 'stationery', 'electronics', 'services'],
      required: true,
    },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: {
      street: { type: String, required: true },
      locality: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      lat: { type: Number, default: 17.4480 },
      lng: { type: Number, default: 78.3910 },
    },
    openingHours: {
      openTime: { type: String, default: '08:00 AM' },
      closeTime: { type: String, default: '10:00 PM' },
    },
    documents: {
      fssaiLicense: { type: String },
      fssaiDocUrl: { type: String },
      drugLicense: { type: String },
      drugLicenseDocUrl: { type: String },
      panNumber: { type: String },
      panDocUrl: { type: String },
      gstin: { type: String },
      tradeLicense: { type: String },
      bankAccountNumber: { type: String },
      bankIfsc: { type: String },
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'pending_review', 'approved', 'rejected', 'changes_requested', 'suspended'],
      default: 'pending_review',
      index: true,
    },
    adminReview: {
      reviewedBy: { type: String },
      reviewedAt: { type: Date },
      rejectionReason: { type: String },
      requestedChanges: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const MerchantApplication =
  mongoose.models.MerchantApplication ||
  mongoose.model('MerchantApplication', merchantApplicationSchema);
export default MerchantApplication;
