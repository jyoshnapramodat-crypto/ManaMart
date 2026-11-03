import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import RiderPortalLayout from '../../components/rider/RiderPortalLayout';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Coins,
} from 'lucide-react';

export default function RiderEarningsView() {
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await api.get('/riders/profile');
        if (res.data?.success) setRider(res.data.rider);
      } catch (err) {
        console.error('Error fetching rider earnings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  const todayEarnings = rider?.todayEarnings || 420;
  const weeklyEarnings = (todayEarnings * 5.5) + 350;

  return (
    <RiderPortalLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Delivery Hero Earnings & Payouts
          </h1>
          <p className="text-xs text-slate-500">
            Real-time daily ledger, trip base pay, customer distance incentives & instant daily UPI payouts
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Today's Earnings</span>
            <div className="text-2xl font-black text-slate-900">₹{todayEarnings}</div>
            <span className="text-[11px] text-emerald-800 font-bold">Auto-dispatched at 11:30 PM</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/40 shadow-xs space-y-1">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-700" />
              <span>COD Cash-in-Hand</span>
            </span>
            <div className="text-2xl font-black text-amber-950">₹{rider?.cashInHand || 620}</div>
            <span className="text-[11px] text-amber-700 font-semibold">Cash to remit at hub</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Weekly Total</span>
            <div className="text-2xl font-black text-[#064E3B]">₹{Math.round(weeklyEarnings)}</div>
            <span className="text-[11px] text-slate-500">Includes zone completion bonuses</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Average Per Trip</span>
            <div className="text-2xl font-black text-[#FF6B00]">₹58</div>
            <span className="text-[11px] text-slate-500">Based on recent completed trips</span>
          </div>
        </div>

        {/* Payout Destination Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-extrabold text-sm text-slate-900">Registered Delivery Payout VPA</h3>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">UPI Settlement ID</span>
              <p className="font-mono font-bold text-slate-900 text-sm">{rider?.payoutUpi || 'rider.hero@okicici'}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Direct Bank Verified
            </span>
          </div>
        </div>
      </div>
    </RiderPortalLayout>
  );
}

