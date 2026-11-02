import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true, // null or empty for global broadcast
    },
    role: {
      type: String,
      enum: ['customer', 'merchant', 'rider', 'admin', 'all'],
      default: 'all',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'post', 'promo', 'verification', 'stock', 'system', 'complaint'],
      default: 'system',
      index: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
