import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RiderPortalLayout from '../../components/rider/RiderPortalLayout';
import {
  Bike,
  Navigation,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Radio,
  Coins,
  Wallet,
} from 'lucide-react';

export default function RiderDashboardView() {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

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

      if (profRes.data?.success) {
        setRider(profRes.data.rider);
        if (profRes.data.activeOrder) {
          setActiveTrip(profRes.data.activeOrder);
        }
      }
      if (tasksRes.data?.success) {
        setTasks(tasksRes.data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching rider data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const res = await api.post(`/riders/tasks/${taskId}/accept`);
      if (res.data?.success) {
        navigate('/rider/active-trip');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting delivery task');
    }
  };

  return (
    <RiderPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Delivery Hero Command Console
          </h1>
          <p className="text-xs text-slate-500">
            Real-time delivery requests in your zone: {rider?.preferredArea || 'Local Zone'}
          </p>
        </div>

        {/* Active Trip Banner if currently delivering */}
        {activeTrip && (
          <div className="p-4 rounded-3xl bg-[#064E3B] text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center animate-pulse">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-300 tracking-wider">
                  Active Delivery In Progress
                </span>
                <h3 className="font-extrabold text-sm text-white">Order #{activeTrip.id?.slice(-8)}</h3>
                <p className="text-[11px] text-emerald-200">En route to customer drop point</p>
              </div>
            </div>

            <NavLink
              to="/rider/active-trip"
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Trip Radar & OTP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        )}

        {/* Quick Stats Grid with COD Cash-in-Hand */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Today's Payouts</span>
            <div className="text-2xl font-black text-slate-900">₹{rider?.todayEarnings || 380}</div>
            <span className="text-[10px] text-emerald-700 font-bold">Direct UPI settlement</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-700" />
              <span>COD Cash-in-Hand</span>
            </span>
            <div className="text-2xl font-black text-amber-950">₹{rider?.cashInHand || 620}</div>
            <span className="text-[10px] text-amber-700 font-semibold">Cash collected to remit at hub</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Completed Trips</span>
            <div className="text-2xl font-black text-slate-900">{rider?.completedTrips || 6}</div>
            <span className="text-[10px] text-slate-400">100% on-time rate</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Partner Rating</span>
            <div className="text-2xl font-black text-slate-900">{rider?.rating || '4.9'} ★</div>
            <span className="text-[10px] text-amber-700 font-bold">Top Courier Tier</span>
          </div>
        </div>

        {/* Nearby Available Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#FF6B00] animate-pulse" />
              <h3 className="font-extrabold text-sm text-slate-900">Nearby Delivery Tasks Available</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{tasks.length} Available</span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No pending delivery tasks in your immediate radius right now. Keep your duty toggle online!
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-[#FF6B00]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm">Pickup: {task.merchantName}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {task.distance || '1.2 km'} away
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Drop-off: {task.customerAddress || 'Local Resident in Zone'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-right">
                      <span className="font-black text-base text-[#064E3B]">₹{task.earnings || 55}</span>
                      <p className="text-[10px] text-slate-400">Rider Payout</p>
                    </div>

                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="px-4 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Accept Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RiderPortalLayout>
  );
}

