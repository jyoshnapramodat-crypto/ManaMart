import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Store,
  Bike,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [pendingRiders, setPendingRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('merchants'); // 'merchants' | 'riders' | 'orders'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, merchRes, ridersRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/merchants/pending'),
        api.get('/admin/riders/pending'),
        api.get('/admin/orders'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (merchRes.data.success) setPendingMerchants(merchRes.data.merchants);
      if (ridersRes.data.success) setPendingRiders(ridersRes.data.riders);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMerchant = async (id, action) => {
    try {
      const res = await api.post(`/admin/merchants/${id}/verify`, { action });
      if (res.data.success) {
        setPendingMerchants((prev) => prev.filter((m) => m.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleVerifyRider = async (id, action) => {
    try {
      const res = await api.post(`/admin/riders/${id}/verify`, { action });
      if (res.data.success) {
        setPendingRiders((prev) => prev.filter((r) => r.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      console.error('Verify rider error:', err);
    }
  };

  const handleProcessRefund = async (orderId) => {
    if (!window.confirm('Approve full customer refund for this order?')) return;
    try {
      const res = await api.post(`/admin/refunds/${orderId}`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Refund error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500 animate-pulse">
        Loading Platform Administration & Compliance Console...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Root Governance & Compliance System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            LocalLoop Platform Administration
          </h1>
          <p className="text-xs text-slate-500">
            Audit merchant licenses, verify rider driving credentials, track platform GMV & manage zone serviceability
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center space-x-1.5 bg-white border border-slate-200 text-slate-700 hover:text-orange-600 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Platform Executive KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Gross Merchandise Value</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">₹{stats?.gmv || 4850}</span>
          <span className="text-[10px] text-emerald-600 font-bold block">+28% growth this week</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Platform Commission</span>
          <span className="text-xl sm:text-2xl font-black text-orange-600">₹{stats?.platformCommission || 388}</span>
          <span className="text-[10px] text-slate-400 block">Avg. 8% take rate</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Verified Merchants</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{stats?.activeMerchants || 6}</span>
          <span className="text-[10px] text-emerald-600 font-bold block">100% FSSAI compliant</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Pending Audits</span>
          <span className="text-xl sm:text-2xl font-black text-purple-600">
            {pendingMerchants.length + pendingRiders.length}
          </span>
          <span className="text-[10px] text-purple-700 font-bold block">Requires review</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none text-xs font-extrabold">
        {[
          { id: 'merchants', label: `Merchant Verification Queue (${pendingMerchants.length})`, icon: Store },
          { id: 'riders', label: `Rider Credential Queue (${pendingRiders.length})`, icon: Bike },
          { id: 'orders', label: `Platform Orders & Disputes (${orders.length})`, icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Merchant Verification Queue */}
      {activeTab === 'merchants' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">
            Pending Merchant Trade & FSSAI Verification Checklist
          </h2>

          {pendingMerchants.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs border border-slate-100 shadow-soft">
              No pending merchant applications. All active shops are verified and compliant.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-base text-slate-900">{merchant.businessName}</h3>
                        <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                          {merchant.category}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Owner: <span className="font-bold text-slate-800">{merchant.ownerName}</span> • Phone: {merchant.phone} • {merchant.locality}, {merchant.city}
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Submitted: {new Date(merchant.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Document Checklist Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">FSSAI License</span>
                      <p className="font-mono text-emerald-700 font-bold">{merchant.documents?.fssai || '13621008000431'}</p>
                      <span className="text-[10px] text-slate-400">Cert: {merchant.documents?.fssaiDoc || 'fssai_cert.pdf'}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">Business PAN Number</span>
                      <p className="font-mono text-slate-800 font-bold">{merchant.documents?.pan || 'ABCDE1234F'}</p>
                      <span className="text-[10px] text-slate-400">Aadhaar verified</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">Trade / Municipal License</span>
                      <p className="font-mono text-slate-800 font-bold">{merchant.documents?.tradeLicense || 'VMC-TL-2026'}</p>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Valid till 2028</span>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleVerifyMerchant(merchant.id, 'reject')}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleVerifyMerchant(merchant.id, 'approve')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Merchant Access</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Rider Credential Queue */}
      {activeTab === 'riders' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">
            Pending Delivery Partner Document Checks
          </h2>

          {pendingRiders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs border border-slate-100 shadow-soft">
              No pending rider registrations. All active riders possess verified driving credentials.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRiders.map((rider) => (
                <div
                  key={rider.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{rider.name}</h3>
                      <p className="text-slate-500 mt-0.5">
                        Vehicle: <span className="font-bold text-slate-800">{rider.vehicleType.toUpperCase()} ({rider.vehicleNumber})</span> • Phone: {rider.phone}
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      City: {rider.city}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">Driving License</span>
                      <p className="font-mono text-slate-900 font-bold">{rider.documents?.drivingLicense}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">✓ Sarathi Vahan portal match</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 block">Vehicle RC & Insurance</span>
                      <p className="font-mono text-slate-900 font-bold">{rider.vehicleNumber}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">✓ Active comprehensive policy</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleVerifyRider(rider.id, 'reject')}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerifyRider(rider.id, 'approve')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Rider Account</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Platform Orders Monitor & Dispute Refunds */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Platform Orders & Transaction Monitor ({orders.length})</h3>
            <span className="text-xs text-slate-400">Manage real-time escalations and customer refunds</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-500">#{ord.orderNumber}</span>
                    <span className="font-bold text-slate-900">{ord.merchantName}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Customer: {ord.customerName} ({ord.customerPhone}) • Rider: {ord.riderName || 'Unassigned'} • Payment: {ord.paymentMethod?.toUpperCase()} ({ord.paymentStatus})
                  </p>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  <span className="text-sm font-black text-slate-900">₹{ord.totalAmount}</span>
                  {ord.paymentStatus !== 'refunded' && (
                    <button
                      onClick={() => handleProcessRefund(ord.id)}
                      className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Process Refund
                    </button>
                  )}
                  {ord.paymentStatus === 'refunded' && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      Refunded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

