import mongoose from 'mongoose';

const documentItemSchema = new mongoose.Schema({
  number: { type: String, trim: true },
  fileName: { type: String },
  originalName: { type: String },
  fileUrl: { type: String },
  mimeType: { type: String },
  fileSize: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  isVerified: { type: Boolean, default: false },
});

const reviewHistoryItemSchema = new mongoose.Schema({
  status: { type: String, required: true },
  reviewedBy: { type: String, required: true },
  reviewedAt: { type: Date, default: Date.now },
  remarks: { type: String, required: true },
});

const merchantApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      index: true,
      default: () => `app-m-${Date.now()}`,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
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
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
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
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    documents: {
      ownerId: documentItemSchema,
      tradeLicense: documentItemSchema,
      panCard: documentItemSchema,
      bankProof: documentItemSchema,
      fssai: documentItemSchema, // Required for food/restaurant/bakery
      drugLicense: documentItemSchema, // Required for pharmacy
      gstin: documentItemSchema, // Optional / where applicable
    },
    status: {
      type: String,
      enum: [
        'not_submitted',
        'pending_verification',
        'under_review',
        'approved',
        'rejected',
        'changes_requested',
        'suspended',
      ],
      default: 'pending_verification',
      index: true,
    },
    adminReview: {
      reviewedBy: { type: String },
      reviewedAt: { type: Date },
      rejectionReason: { type: String },
      requestedChanges: { type: String },
      remarks: { type: String },
    },
    reviewHistory: [reviewHistoryItemSchema],
    resubmittedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const MerchantApplication =
  mongoose.models.MerchantApplication ||
  mongoose.model('MerchantApplication', merchantApplicationSchema);
export default MerchantApplication;
