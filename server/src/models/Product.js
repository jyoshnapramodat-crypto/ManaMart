import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameTelugu: { type: String },
    category: { type: String, required: true, index: true },
    description: { type: String },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    unit: { type: String, default: '1 unit' }, // e.g. 500g, 1 kg, 1 pack
    inStock: { type: Boolean, default: true },
    lowStock: { type: Boolean, default: false },
    stockCount: { type: Number, default: 50 },
    isVeg: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 45 },
    image: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

