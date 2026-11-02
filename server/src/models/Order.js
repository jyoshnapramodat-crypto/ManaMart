import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  nameTelugu: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  storeId: { type: String, required: true },
  storeName: { type: String, required: true },
  unit: { type: String, default: '1 unit' },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
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
    customerPhone: {
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
      required: true,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      locality: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 25 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CashOnDelivery', 'Card', 'Wallet'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid',
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Accepted', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    deliveryOtp: {
      type: String,
      required: true,
    },
    assignedRider: {
      riderId: { type: String, index: true },
      name: { type: String },
      phone: { type: String },
      acceptedAt: { type: Date },
      completedAt: { type: Date },
    },
    substitutionsPreference: {
      type: String,
      enum: ['call_me', 'smart_replace', 'refund'],
      default: 'smart_replace',
    },
    rejectionReason: { type: String },
    cancellationReason: { type: String },
    eta: { type: String, default: '15-20 mins' },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
