import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
