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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    merchantReply: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
