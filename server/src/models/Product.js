import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    merchantId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameTelugu: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: '1 unit',
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    lowStock: {
      type: Boolean,
      default: false,
    },
    stockCount: {
      type: Number,
      default: 50,
      min: 0,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    },
    tags: [{
      type: String,
    }],
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
