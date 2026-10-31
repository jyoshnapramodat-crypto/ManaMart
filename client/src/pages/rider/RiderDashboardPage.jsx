import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { socket } from '../../services/socket';
import {
  Bike,
  Navigation,
  MapPin,
  CheckCircle2,
  DollarSign,
  Clock,
  ShieldCheck,
  Phone,
  KeyRound,
  Store,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function RiderDashboardPage() {
  const [rider, setRider] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  // OTP Verification modal state
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Counter offer state
  const [counterId, setCounterId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('65');

  useEffect(() => {
    fetchRiderData();
  }, []);

  const fetchRiderData = async () => {
    setLoading(true);
    try {
      const [profRes, tasksRes] = await Promise.all([
        api.get('/riders/profile'),
        api.get('/riders/tasks/nearby'),
      ]);

      if (profRes.data.success) {
        setRider(profRes.data.rider);
        setIsOnline(profRes.data.rider.isOnline);
        if (profRes.data.activeOrder) {
          setActiveOrder(profRes.data.activeOrder);
        }
      }
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching rider data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const res = await api.put('/riders/status');
      if (res.data.success) {
        setIsOnline(res.data.isOnline);
      }
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const res = await api.post(`/riders/tasks/${taskId}/accept`);
      if (res.data.success) {
        setActiveOrder(res.data.order);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error('Accept task error:', err);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setOtpError(null);

    try {
      const res = await api.post(`/riders/tasks/${activeOrder.id}/verify-otp`, { otp: otpInput });
      if (res.data.success) {
        setOtpSuccess(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });

        if (rider) {
          setRider((prev) => ({
            ...prev,
            todayEarnings: res.data.riderEarnings || (prev.todayEarnings + 55),
            todayDeliveries: prev.todayDeliveries + 1,
          }));
        }

        setTimeout(() => {
          setActiveOrder(null);
          setOtpSuccess(false);
          setOtpInput('');
          fetchRiderData();
        }, 2200);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP code. Please verify with customer.');
    }
  };

  const handleSimulateGPSMove = () => {
    if (!activeOrder) return;
    const newLat = 17.4470 + Math.random() * 0.005;
    const newLng = 78.3900 + Math.random() * 0.005;
    socket.emit('rider:location_update', { orderId: activeOrder.id, lat: newLat, lng: newLng });
    alert('Live GPS coordinates broadcast to customer tracking map via Socket.IO!');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500 animate-pulse">
        Connecting to Rider Dispatch Network...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Rider Header & Availability Switch */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg text-white">{rider?.name || 'Suresh Varma'}</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified Rider
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {rider?.vehicleName || 'Hero Splendor Plus'} • <span className="font-mono">{rider?.vehicleNumber || 'TS 09 AB 1234'}</span>
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <div className="flex items-center space-x-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span className="text-xs font-bold text-slate-200">
              {isOnline ? 'ONLINE & READY' : 'OFFLINE'}
            </span>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isOnline
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Wallet & Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Today's Payouts</span>
          <span className="text-2xl font-black text-slate-900">₹{rider?.todayEarnings || 840}</span>
          <span className="text-[10px] text-emerald-600 font-bold block">Instant bank deposit</span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Today's Trips</span>
          <span className="text-2xl font-black text-orange-600">{rider?.todayDeliveries || 8} completed</span>
          <span className="text-[10px] text-slate-500 font-medium block">Avg: 22 mins / trip</span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Rider Rating</span>
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-black text-slate-900">{rider?.rating || 4.9}</span>
            <span className="text-amber-500 font-bold">★</span>
          </div>
          <span className="text-[10px] text-slate-400 block">342 lifetime orders</span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Driving License</span>
          <span className="text-xs font-mono font-bold text-slate-800 block truncate">
            {rider?.drivingLicenseNumber || 'DL-TS-2021-99882'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block">✓ Gov Verified</span>
        </div>
      </div>

      {/* Active Trip Workflow */}
      {activeOrder && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-500 shadow-premium space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <h2 className="font-extrabold text-base text-slate-900">
                Active Delivery in Progress (#{activeOrder.orderNumber})
              </h2>
            </div>
            <button
              onClick={handleSimulateGPSMove}
              className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
            >
              <Navigation className="w-3 h-3 text-orange-600" />
              <span>Ping GPS Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Pickup */}
            <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-orange-950">
                <Store className="w-4 h-4 text-orange-600" />
                <span>Pickup From Store</span>
              </div>
              <p className="font-extrabold text-slate-900">{activeOrder.merchantName}</p>
              <p className="text-slate-500">{activeOrder.merchantAddress}</p>
            </div>

            {/* Drop-off */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-blue-950">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Deliver to Customer</span>
              </div>
              <p className="font-extrabold text-slate-900">{activeOrder.customerName}</p>
              <p className="text-slate-500">{activeOrder.deliveryAddress?.street}, {activeOrder.deliveryAddress?.locality}</p>
            </div>
          </div>

          {/* Customer OTP Verification Box */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-950">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <h4 className="font-black text-sm">Customer Delivery Hand-off Verification</h4>
            </div>
            <p className="text-xs text-emerald-800">
              Ask customer for their 4-digit Delivery OTP (shown on their ManaMart app) to finish order:
            </p>

            {otpSuccess ? (
              <div className="p-3 bg-emerald-600 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Delivery Verified! ₹55 credited to your Rider Wallet.</span>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex gap-2">
                <input
                  type="text"
                  maxLength="4"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 4-Digit OTP (e.g. 4892)"
                  className="flex-1 px-4 py-2 text-sm font-mono tracking-widest text-center rounded-xl bg-white border border-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl shadow-md transition-all whitespace-nowrap"
                >
                  Verify OTP & Complete
                </button>
              </form>
            )}

            {otpError && (
              <p className="text-xs font-bold text-red-600">{otpError}</p>
            )}
          </div>
        </div>
      )}

      {/* Available Delivery Tasks Radar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Nearby Delivery Radar</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {tasks.length} requests available
            </span>
          </h2>
          <span className="text-xs text-slate-400">Updates live automatically</span>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs border border-slate-100 shadow-soft">
            No nearby pickup requests currently. Stay online to receive the next available order!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-mono font-bold text-slate-500">#{task.orderNumber}</span>
                  <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    Payout: ₹{task.proposedPayout}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <Store className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">{task.merchantName}</span>
                      <span className="text-[11px] text-slate-400">{task.merchantAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Deliver to Locality</span>
                      <span className="text-[11px] text-slate-400">{task.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Est. Distance: {task.distanceKm} km
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <span>Accept Task</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
