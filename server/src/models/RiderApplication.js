import mongoose from 'mongoose';

const riderApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    city: { type: String, required: true },
    preferredArea: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'ev', 'bicycle'],
      default: 'bike',
    },
    vehicleName: { type: String, default: 'Two-Wheeler' },
    vehicleNumber: { type: String },
    documents: {
      drivingLicenseNumber: { type: String },
      drivingLicenseDocUrl: { type: String },
      rcNumber: { type: String },
      rcDocUrl: { type: String },
      insurancePolicyNumber: { type: String },
      insuranceDocUrl: { type: String },
      idProofNumber: { type: String },
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

export const RiderApplication =
  mongoose.models.RiderApplication ||
  mongoose.model('RiderApplication', riderApplicationSchema);
export default RiderApplication;
