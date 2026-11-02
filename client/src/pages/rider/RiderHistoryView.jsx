import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import RiderPortalLayout from '../../components/rider/RiderPortalLayout';
import {
  History,
  CheckCircle2,
  MapPin,
  Store,
  DollarSign,
  Calendar,
} from 'lucide-react';

export default function RiderHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/riders/tasks/history');
        if (res.data?.success) {
          setHistory(res.data.history || []);
        }
      } catch (err) {
        console.error('Error fetching rider history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <RiderPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Delivery History & Trip Logs
          </h1>
          <p className="text-xs text-slate-500">
            Chronological audit of completed neighborhood hand-offs and verified payouts
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading delivery history...</div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            No completed deliveries recorded in this session yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">Trip #{trip.id}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      OTP Verified
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    From: {trip.merchantName} → To: {trip.customerAddress || 'Local Resident'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Completed at {new Date(trip.completedAt || Date.now()).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-black text-base text-[#064E3B]">₹{trip.earnings || 55}</span>
                  <p className="text-[10px] text-slate-400">Trip Credit</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RiderPortalLayout>
  );
}

