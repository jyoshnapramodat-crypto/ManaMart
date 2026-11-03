import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    storeName: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    storeRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    storeTags: [{ type: String }],
    comment: {
      type: String,
      trim: true,
    },
    merchantReply: {
      type: String,
      trim: true,
    },
    riderId: {
      type: String,
      index: true,
    },
    riderName: {
      type: String,
    },
    riderRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    riderTip: {
      type: Number,
      default: 0,
    },
    autoDisputeCreated: {
      type: Boolean,
      default: false,
    },
    disputeId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
