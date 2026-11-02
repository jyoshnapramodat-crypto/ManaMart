import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MerchantPortalLayout from '../../components/merchant/MerchantPortalLayout';
import {
  CircleDollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default function MerchantFinanceView() {
  const [storeData, setStoreData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        const res = await api.get('/merchants/my-store');
        if (res.data?.success) {
          setStoreData(res.data.store);
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Error fetching finance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  const totalRev = analytics?.totalRevenue || 0;
  const platformFee = Math.round(totalRev * 0.05); // 5% platform commission
  const netSettlement = totalRev - platformFee;

  return (
    <MerchantPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Financial Ledger & Settlements
          </h1>
          <p className="text-xs text-slate-500">
            Automated daily payouts, platform commission breakdown, and banking destination
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Gross Sales Value</span>
            <div className="text-2xl font-black text-slate-900">₹{totalRev}</div>
            <span className="text-[11px] text-slate-400">Total customer cart checkouts</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Platform Commission (5%)</span>
            <div className="text-2xl font-black text-amber-700">-₹{platformFee}</div>
            <span className="text-[11px] text-slate-400">Fixed rate, no hidden surge fees</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Net Merchant Settlement</span>
            <div className="text-2xl font-black text-[#064E3B]">₹{netSettlement}</div>
            <span className="text-[11px] text-emerald-800 font-bold">Dispatched via IMPS/UPI daily</span>
          </div>
        </div>

        {/* Banking and Payout Destination */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <CreditCard className="w-5 h-5 text-[#064E3B]" />
            <h3 className="font-extrabold text-sm text-slate-900">Registered Settlement Destination</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Merchant Settlement Account</span>
              <p className="font-mono font-bold text-slate-800 text-sm">
                {storeData?.payoutUpi || 'merchant.store@okhdfcbank'}
              </p>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified for Instant Daily Payouts
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Settlement Frequency</span>
              <p className="font-bold text-slate-800 text-sm">Every Night at 11:59 PM (T+0)</p>
              <span className="text-[10px] text-slate-500">Zero withdrawal delay for local merchants</span>
            </div>
          </div>
        </div>
      </div>
    </MerchantPortalLayout>
  );
}

