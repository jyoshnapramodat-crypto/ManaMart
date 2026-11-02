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

const riderApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      index: true,
      default: () => `app-r-${Date.now()}`,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
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
    city: {
      type: String,
      required: true,
    },
    preferredArea: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'ev', 'bicycle'],
      default: 'bike',
    },
    vehicleName: {
      type: String,
      default: 'Motorcycle',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    documents: {
      govtId: documentItemSchema, // Aadhaar / Voter ID
      drivingLicense: documentItemSchema, // Driving License
      rc: documentItemSchema, // Registration Certificate
      insurance: documentItemSchema, // Vehicle Insurance
      profilePhoto: documentItemSchema, // Rider Photograph
      addressProof: documentItemSchema, // Address Proof
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

export const RiderApplication =
  mongoose.models.RiderApplication ||
  mongoose.model('RiderApplication', riderApplicationSchema);
export default RiderApplication;
