import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RiderPortalLayout from '../../components/rider/RiderPortalLayout';
import confetti from 'canvas-confetti';
import {
  Navigation,
  MapPin,
  Store,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Bike,
} from 'lucide-react';

export default function RiderActiveTripView() {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // OTP Form State
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  const fetchActiveTrip = async () => {
    setLoading(true);
    try {
      const res = await api.get('/riders/profile');
      if (res.data?.success && res.data.activeOrder) {
        setActiveOrder(res.data.activeOrder);
      }
    } catch (err) {
      console.error('Error fetching active trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setOtpError(null);
    setVerifying(true);

    try {
      const res = await api.post(`/riders/tasks/${activeOrder.id}/verify-otp`, {
        otp: otpInput.trim(),
      });

      if (res.data?.success) {
        setDeliveredSuccess(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          navigate('/rider/earnings');
        }, 2200);
      } else {
        setOtpError(res.data?.message || 'Incorrect delivery OTP.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Incorrect delivery OTP. Please verify with customer.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <RiderPortalLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Active Delivery Radar
          </h1>
          <p className="text-xs text-slate-500">
            Real-time GPS trip tracking & secure customer hand-off verification
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading active trip radar...</div>
        ) : !activeOrder ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">No Active Trips Currently</h3>
            <p className="text-xs text-slate-500">
              You are currently online. Return to the dashboard to accept new pickup tasks.
            </p>
            <button
              onClick={() => navigate('/rider/dashboard')}
              className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Back to Dashboard Tasks
            </button>
          </div>
        ) : deliveredSuccess ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-emerald-200 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Delivery Completed Successfully!</h2>
            <p className="text-xs text-slate-600">
              Order #{activeOrder.id} verified with customer OTP. Payout has been credited to your daily wallet.
            </p>
            <div className="text-sm font-bold text-emerald-800">
              Redirecting to Earnings Ledger...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Trip Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-black text-base text-slate-900">Trip Order #{activeOrder.id}</span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-orange-100 text-[#FF6B00] animate-pulse">
                  EN ROUTE TO DROP
                </span>
              </div>

              {/* Step 1: Pickup Location */}
              <div className="flex items-start space-x-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Pickup Restaurant / Store</span>
                  <p className="font-black text-sm text-slate-800">{activeOrder.merchantName || 'Swagath Grand'}</p>
                  <p className="text-slate-500 text-[11px]">Shop 4, Main Road, Narakoduru</p>
                </div>
              </div>

              {/* Step 2: Dropoff Location */}
              <div className="flex items-start space-x-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Customer Delivery Destination</span>
                  <p className="font-black text-sm text-slate-800">
                    {activeOrder.deliveryAddress?.street || 'Plot 42, Sai Nagar'}, {activeOrder.deliveryAddress?.locality || 'Narakoduru'}
                  </p>
                  <p className="text-slate-500 text-[11px]">Customer: {activeOrder.customerName || 'Local Resident'}</p>
                </div>
              </div>

              {/* Google Maps External Navigation Trigger */}
              <div className="pt-2 flex items-center space-x-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activeOrder.deliveryAddress?.street ? `${activeOrder.deliveryAddress.street}, ${activeOrder.deliveryAddress.locality}` : 'Narakoduru, Guntur'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#064E3B] hover:bg-[#033B2D] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open Turn-by-Turn in Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <a
                  href={`tel:${activeOrder.customerPhone || '9876543210'}`}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                </a>
              </div>
            </div>

            {/* Secure Customer Hand-off OTP Verification Form */}
            <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Customer Delivery Hand-off OTP</h3>
                  <p className="text-[11px] text-slate-500">Ask the customer for the 4-digit code shown on their app</p>
                </div>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit OTP"
                  className="w-full text-center tracking-widest text-2xl font-black font-mono py-3 rounded-2xl border-2 border-slate-200 focus:border-[#FF6B00] outline-none"
                />

                <button
                  type="submit"
                  disabled={verifying || otpInput.length < 4}
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Delivery & Collect Payout</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </RiderPortalLayout>
  );
}

