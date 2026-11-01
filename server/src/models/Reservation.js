import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true, index: true },
    guestPhone: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guestsCount: { type: Number, required: true, min: 1, max: 20 },
    seatingArea: {
      type: String,
      enum: ['Main AC Dining Hall', 'Rooftop Garden Seating', 'Family Private Booth', 'Outdoor Courtyard'],
      default: 'Main AC Dining Hall',
    },
    tableNumber: { type: String, default: 'Table #4' },
    specialRequests: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'],
      default: 'Confirmed',
      index: true,
    },
    isOtpVerified: { type: Boolean, default: true },
    qrEntryCode: { type: String },
  },
  { timestamps: true }
);

export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
export default Reservation;

