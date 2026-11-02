import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';
import MerchantPortalLayout from '../../components/merchant/MerchantPortalLayout';
import {
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  Store,
} from 'lucide-react';

export default function MerchantDashboardView() {
  const [storeData, setStoreData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [storeRes, ordersRes] = await Promise.all([
          api.get('/merchants/my-store'),
          api.get('/merchants/orders'),
        ]);

        if (storeRes.data?.success) {
          setStoreData(storeRes.data.store);
          setAnalytics(storeRes.data.analytics);
        }
        if (ordersRes.data?.success) {
          setRecentOrders(ordersRes.data.orders?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error('Error fetching merchant overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <MerchantPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Store Performance & Real-Time Overview
          </h1>
          <p className="text-xs text-slate-500">
            Live settlements, customer order flow, and catalog metrics for {storeData?.name || 'your store'}
          </p>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Settled Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{analytics?.totalRevenue || 0}
            </div>
            <span className="text-[11px] text-emerald-800 font-bold">Verified order settlements</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {analytics?.totalOrders || recentOrders.length}
            </div>
            <span className="text-[11px] text-[#FF6B00] font-bold">Dispatched & Delivered</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Store Rating</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {storeData?.rating || '4.8'} ★
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Customer verified reviews</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Local Followers</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {analytics?.followersCount || 12}
            </div>
            <span className="text-[11px] text-purple-700 font-bold">Receiving daily restock alerts</span>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Recent Customer Inbound Orders</h3>
              <p className="text-xs text-slate-500">Incoming requests requiring preparation & handover</p>
            </div>
            <NavLink
              to="/merchant/orders"
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              <span>Manage All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent orders received yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">Order #{order.id?.slice(-8)}</span>
                    <p className="text-[11px] text-slate-500">
                      {order.items?.length || 1} items • ₹{order.totalAmount} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-orange-100 text-[#FF6B00]'
                  }`}>
                    {order.orderStatus?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MerchantPortalLayout>
  );
}

