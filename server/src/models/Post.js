import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    merchantId: {
      type: String,
      required: true,
      index: true,
    },
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeLogo: {
      type: String,
    },
    storeLocality: {
      type: String,
    },
    storeCity: {
      type: String,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{
      type: String,
    }],
    type: {
      type: String,
      enum: ['general', 'new_arrival', 'restock', 'daily_special', 'offer'],
      default: 'general',
      index: true,
    },
    tag: {
      type: String,
      default: 'daily_special',
    },
    discountCode: {
      type: String,
      trim: true,
    },
    productIds: [{
      type: String,
    }],
    likes: [{
      type: String, // User IDs who liked the post
    }],
    likesCount: {
      type: Number,
      default: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
