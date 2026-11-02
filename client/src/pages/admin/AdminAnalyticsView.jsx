import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPortalLayout from '../../components/admin/AdminPortalLayout';
import {
  BarChart3,
  TrendingUp,
  Store,
  Bike,
  Users,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Platform Analytics & Governance Overview
            </h1>
            <p className="text-xs text-slate-500">
              Macro performance, gross merchandise volume (GMV), active courier fleet, and merchant serviceability
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Refresh</span>
          </button>
        </div>

        {/* 4 Macro Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Platform GMV</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{stats?.totalGMV || '1,42,850'}
            </div>
            <span className="text-[11px] text-purple-700 font-bold">Total verified orders settled</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalOrders || 842}</div>
            <span className="text-[11px] text-emerald-800 font-bold">Across all hyper-local zones</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Active Stores</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.verifiedMerchants || 48}</div>
            <span className="text-[11px] text-amber-700 font-bold">{stats?.pendingMerchants || 3} pending audits</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Delivery Heroes</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.activeRiders || 32}</div>
            <span className="text-[11px] text-blue-700 font-bold">{stats?.pendingRiders || 2} awaiting license audit</span>
          </div>
        </div>

        {/* Platform Compliance Status Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <h3 className="font-extrabold text-sm text-slate-900">Regulatory & Safety System Overview</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All stores registered on ManaMart must hold active FSSAI certifications (for food establishments) and state pharmacy licenses (for drug dispensing). Delivery hero credentials are verified against regional RTO records prior to trip dispatch.
          </p>
        </div>
      </div>
    </AdminPortalLayout>
  );
}

