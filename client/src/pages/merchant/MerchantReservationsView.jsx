import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MerchantPortalLayout from '../../components/merchant/MerchantPortalLayout';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
} from 'lucide-react';

export default function MerchantReservationsView() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants/reservations');
      if (res.data?.success) {
        setReservations(res.data.reservations || []);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (resId, newStatus) => {
    try {
      const res = await api.put(`/merchants/reservations/${resId}`, { status: newStatus });
      if (res.data?.success) {
        setReservations((prev) =>
          prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reservation');
    }
  };

  return (
    <MerchantPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dine-In Table Bookings
          </h1>
          <p className="text-xs text-slate-500">
            Manage table reservations, guest counts, and special seating requests
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            No table reservations scheduled for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-sm text-slate-900">{r.customerName || 'Guest'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'seated' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Slot: {r.date || 'Today'} at {r.timeSlot || '08:00 PM'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Party Size: {r.guestCount || 2} Guests</span>
                  </div>

                  {r.phone && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.phone}</span>
                    </div>
                  )}

                  {r.specialNotes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      Notes: {r.specialNotes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                  {r.status !== 'seated' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'seated')}
                      className="px-3 py-1 bg-[#064E3B] text-white rounded-xl font-bold cursor-pointer"
                    >
                      Seat Guests
                    </button>
                  )}
                  {r.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'cancelled')}
                      className="px-3 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MerchantPortalLayout>
  );
}

