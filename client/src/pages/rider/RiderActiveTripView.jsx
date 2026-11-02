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
  Compass,
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

  const openNavigation = (lat, lng, label) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const encodedLabel = encodeURIComponent(label);
    
    if (isMobile) {
      // Android / iOS native geo URI with fallback to Google Maps directions
      window.location.href = `geo:${lat},${lng}?q=${lat},${lng}(${encodedLabel})`;
      setTimeout(() => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }, 500);
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setOtpError(null);
    setVerifying(true);

    const orderTargetId = activeOrder.id || activeOrder.orderId;

    try {
      // Strict OTP hand-off via backend API endpoint /api/orders/:id/verify-delivery (no manual bypass)
      const res = await api.post(`/orders/${orderTargetId}/verify-delivery`, {
        otp: otpInput.trim(),
        taskId: activeOrder.id,
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
      setOtpError(
        err.response?.data?.message ||
          'Invalid OTP. Customer must provide the 4-digit code shown on their order tracking screen.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const storeLat = activeOrder?.storeGeo?.lat || 16.2345;
  const storeLng = activeOrder?.storeGeo?.lng || 80.5432;
  const dropLat = activeOrder?.dropGeo?.lat || 16.2389;
  const dropLng = activeOrder?.dropGeo?.lng || 80.5491;

  return (
    <RiderPortalLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Active Delivery Radar
          </h1>
          <p className="text-xs text-slate-500">
            Real-time GPS trip tracking & strict customer hand-off OTP verification
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
              Order #{activeOrder.id} verified with customer 4-digit OTP. Payout has been credited to your daily wallet.
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

              {/* Step 1: Pickup Location & Dedicated Navigation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[10px]">1. Store Pickup Location</span>
                      <p className="font-black text-sm text-slate-800">{activeOrder.merchantName || 'Swagath Grand'}</p>
                      <p className="text-slate-500 text-[11px]">Shop 4, Main Road, Narakoduru</p>
                      <span className="text-[10px] font-mono text-emerald-800 font-semibold">
                        GPS: {storeLat}, {storeLng}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openNavigation(storeLat, storeLng, activeOrder.merchantName || 'Store Pickup')}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Navigate to Store</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Dropoff Location & Dedicated Navigation */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#FF6B00] uppercase text-[10px]">2. Customer Drop Destination</span>
                      <p className="font-black text-sm text-slate-800">
                        {activeOrder.deliveryAddress?.street || 'Plot 42, Sai Nagar'}, {activeOrder.deliveryAddress?.locality || 'Narakoduru'}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Customer: <span className="font-bold">{activeOrder.customerName || 'Local Resident'}</span>
                      </p>
                      <span className="text-[10px] font-mono text-orange-700 font-semibold">
                        GPS: {dropLat}, {dropLng}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openNavigation(dropLat, dropLng, activeOrder.customerName || 'Customer Drop')}
                      className="px-3 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate to Drop</span>
                    </button>

                    <a
                      href={`tel:${activeOrder.customerPhone || '9876543210'}`}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Strict Customer Hand-off OTP Verification Form */}
            <div className="bg-white rounded-3xl p-6 border-2 border-orange-300 shadow-md space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Enforced Customer Delivery Hand-off OTP</h3>
                  <p className="text-[11px] text-slate-500">
                    Strict backend verification at <code>/api/orders/:id/verify-delivery</code> (no manual bypass)
                  </p>
                </div>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-600">
                  Ask customer for their 4-Digit Delivery Code:
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full text-center tracking-[0.5em] text-3xl font-black font-mono py-3 rounded-2xl border-2 border-slate-300 focus:border-[#FF6B00] outline-none bg-slate-50 focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={verifying || otpInput.length < 4}
                  className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {verifying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify OTP & Complete Delivery</span>
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
