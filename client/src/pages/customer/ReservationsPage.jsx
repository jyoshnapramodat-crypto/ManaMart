import React, { useState } from 'react';
import api from '../../services/api';
import {
  CalendarDays,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  UtensilsCrossed,
  MapPin,
} from 'lucide-react';

export default function ReservationsPage() {
  const [restaurantId, setRestaurantId] = useState('m-1');
  const [partySize, setPartySize] = useState('4');
  const [reservationDate, setReservationDate] = useState('2026-11-05');
  const [reservationTime, setReservationTime] = useState('08:30 PM');
  const [specialRequests, setSpecialRequests] = useState('Window booth table preferred.');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/orders/reservation', {
        merchantId: restaurantId,
        partySize: Number(partySize),
        reservationDate,
        reservationTime,
        specialRequests,
      });

      if (res.data.success) {
        setBookingStatus(res.data.reservation);
      }
    } catch (err) {
      console.error('Reservation error:', err);
      alert('Failed to book table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      <div>
        <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 mb-2">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
          <span>Priority Dine-In Booking</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Restaurant Table Reservations</span>
          <CalendarDays className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-xs text-slate-500">
          Reserve confirmed dining tables at top authentic restaurants in your neighborhood without waitlists.
        </p>
      </div>

      {bookingStatus ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Table Reservation Confirmed!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your table for <span className="font-bold text-slate-900">{bookingStatus.partySize} guests</span> at{' '}
            <span className="font-bold text-orange-600">{bookingStatus.merchantName}</span> is reserved for{' '}
            <span className="font-bold">{bookingStatus.reservationDate}</span> at{' '}
            <span className="font-bold">{bookingStatus.reservationTime}</span>.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1">
            <span className="font-bold text-slate-700 block">Reservation Pass:</span>
            <p className="font-mono text-orange-600 font-bold">Booking #{bookingStatus.id}</p>
            <p className="text-slate-500">Guest: {bookingStatus.customerName} ({bookingStatus.customerPhone})</p>
          </div>

          <button
            onClick={() => setBookingStatus(null)}
            className="text-xs font-bold text-orange-600 hover:underline"
          >
            Book Another Table
          </button>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-soft space-y-4">
          <div className="text-xs space-y-1">
            <label className="font-bold text-slate-700 block">Select Restaurant</label>
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
            >
              <option value="m-1">Swagath Grand Authentic Kitchen (Madhapur)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Guests</label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
              >
                <option value="2">2 Guests (Couple)</option>
                <option value="4">4 Guests (Family)</option>
                <option value="6">6 Guests (Group)</option>
                <option value="8">8+ Guests (Celebration)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
              <select
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
              >
                <option value="12:30 PM">12:30 PM (Lunch)</option>
                <option value="01:30 PM">01:30 PM (Lunch)</option>
                <option value="07:30 PM">07:30 PM (Dinner)</option>
                <option value="08:30 PM">08:30 PM (Dinner)</option>
                <option value="09:30 PM">09:30 PM (Late Dinner)</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Special Preferences</label>
            <textarea
              rows="2"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Birthday decoration, Quiet booth table, Child seat..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            {loading ? 'Confirming with Restaurant...' : 'Reserve Table Now'}
          </button>
        </form>
      )}

    </div>
  );
}

