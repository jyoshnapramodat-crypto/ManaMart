import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reporterId: {
      type: String,
      required: true,
      index: true,
    },
    reporterName: {
      type: String,
    },
    reporterRole: {
      type: String,
      default: 'customer',
    },
    targetType: {
      type: String,
      enum: ['store', 'product', 'post', 'rider', 'order'],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetName: {
      type: String,
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminRemarks: {
      type: String,
    },
    resolvedBy: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export default Report;
