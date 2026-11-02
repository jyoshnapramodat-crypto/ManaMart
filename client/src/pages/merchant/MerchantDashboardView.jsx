import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';
import MerchantPortalLayout from '../../components/merchant/MerchantPortalLayout';
import soundService from '../../services/soundService';
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
  ChefHat,
  Truck,
  CheckCircle2,
  Bell,
  Volume2,
  VolumeX,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  PackageCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function MerchantDashboardView() {
  const [storeData, setStoreData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isRingtonePlaying, setIsRingtonePlaying] = useState(false);
  const [acknowledgedOrders, setAcknowledgedOrders] = useState(new Set());

  useEffect(() => {
    loadDashboardData();

    return () => {
      soundService.stopOrderRingtoneLoop();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [storeRes, ordersRes, productsRes] = await Promise.all([
        api.get('/merchants/my-store'),
        api.get('/merchants/orders'),
        api.get('/merchants/products'),
      ]);

      if (storeRes.data?.success) {
        setStoreData(storeRes.data.store);
        setAnalytics(storeRes.data.analytics);
      }
      if (ordersRes.data?.success) {
        const orderList = ordersRes.data.orders || [];
        setOrders(orderList);
        checkAndTriggerRingtone(orderList);
      }
      if (productsRes.data?.success) {
        setProducts(productsRes.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching merchant dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndTriggerRingtone = (orderList) => {
    const hasUnacknowledgedNewOrder = orderList.some(
      (o) =>
        (o.orderStatus?.toUpperCase() === 'NEW' ||
          o.orderStatus?.toUpperCase() === 'RECEIVED' ||
          o.orderStatus?.toLowerCase() === 'pending') &&
        !acknowledgedOrders.has(o.id || o.orderId)
    );

    if (hasUnacknowledgedNewOrder) {
      soundService.startOrderRingtoneLoop();
      setIsRingtonePlaying(true);
    } else {
      soundService.stopOrderRingtoneLoop();
      setIsRingtonePlaying(false);
    }
  };

  const handleAcknowledge = (orderId) => {
    setAcknowledgedOrders((prev) => new Set([...prev, orderId]));
    soundService.stopOrderRingtoneLoop();
    setIsRingtonePlaying(false);
    handleUpdateStatus(orderId, 'PREPARING');
  };

  const handleMuteRingtone = () => {
    soundService.stopOrderRingtoneLoop();
    setIsRingtonePlaying(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o.orderId === orderId ? { ...o, orderStatus: newStatus } : o
          )
        );
        // If moving past NEW/RECEIVED, ensure ringtone stops if no other new orders exist
        const updated = orders.map((o) =>
          o.id === orderId || o.orderId === orderId ? { ...o, orderStatus: newStatus } : o
        );
        checkAndTriggerRingtone(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleProductStock = async (product) => {
    const nextInStock = !product.inStock;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: nextInStock } : p))
    );

    try {
      await api.put(`/merchants/products/${product.id}`, { inStock: nextInStock });
    } catch (err) {
      // Revert if failed
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: !nextInStock } : p))
      );
      alert('Could not update stock status. Please try again.');
    }
  };

  // Find active orders requiring merchant attention
  const activeIncomingOrders = orders.filter((o) => {
    const st = (o.orderStatus || '').toUpperCase();
    return ['NEW', 'RECEIVED', 'PENDING', 'PREPARING', 'READY_FOR_PICKUP'].includes(st);
  });

  const ringingOrder = activeIncomingOrders.find(
    (o) =>
      ['NEW', 'RECEIVED', 'PENDING'].includes((o.orderStatus || '').toUpperCase()) &&
      !acknowledgedOrders.has(o.id || o.orderId)
  );

  return (
    <MerchantPortalLayout>
      <div className="space-y-6">
        {/* ============================================================== */}
        {/* AUDIO RINGTONE ACTIVE NOTIFICATION BANNER                      */}
        {/* ============================================================== */}
        {ringingOrder && (
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-amber-300 animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-white text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Incoming Order Alert
                  </span>
                  <span className="text-xs font-bold text-amber-100">Web Audio Active</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                  Order #{ringingOrder.id?.slice(-8) || ringingOrder.orderId?.slice(-8)} Ringing!
                </h3>
                <p className="text-xs text-white/90">
                  {ringingOrder.items?.length || 1} items • ₹{ringingOrder.totalAmount} • Please acknowledge immediately
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={() => handleAcknowledge(ringingOrder.id || ringingOrder.orderId)}
                className="px-5 py-2.5 bg-white text-[#064E3B] hover:bg-emerald-50 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Acknowledge & Cook</span>
              </button>
              <button
                onClick={handleMuteRingtone}
                className="p-2.5 bg-black/30 hover:bg-black/50 text-white rounded-2xl transition-all cursor-pointer"
                title="Mute Ringtone"
              >
                {isRingtonePlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Merchant Workspace</span>
              <span className="text-xs font-bold bg-emerald-100 text-[#064E3B] px-2.5 py-0.5 rounded-full">
                Live Kitchen
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Kitchen order workflow, audio alerts, and instant inventory controls for {storeData?.name || 'your store'}
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Workspace</span>
          </button>
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
              {analytics?.totalOrders || orders.length}
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

        {/* ============================================================== */}
        {/* MULTI-STAGE ORDER WORKFLOW & KOT                               */}
        {/* States: RECEIVED -> PREPARING -> READY_FOR_PICKUP -> HANDED_OVER*/}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#064E3B]" />
                <span>Active Kitchen Order Tickets (KOT) & Queue</span>
              </h3>
              <p className="text-xs text-slate-500">
                Multi-stage lifecycle: Received → Preparing → Ready for Pickup → Handed Over
              </p>
            </div>
            <NavLink
              to="/merchant/orders"
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              <span>View All Order History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No orders received yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map((order) => {
                const oid = order.id || order.orderId;
                const status = (order.orderStatus || '').toUpperCase();
                const isUpdating = updatingId === oid;

                return (
                  <div
                    key={oid}
                    className={`p-4 rounded-2xl border transition-all ${
                      ['NEW', 'RECEIVED', 'PENDING'].includes(status)
                        ? 'bg-orange-50/60 border-orange-200'
                        : status === 'PREPARING'
                        ? 'bg-amber-50/50 border-amber-200'
                        : status === 'READY_FOR_PICKUP'
                        ? 'bg-blue-50/50 border-blue-200'
                        : status === 'HANDED_OVER'
                        ? 'bg-purple-50/50 border-purple-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            Order #{oid?.slice(-8)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              ['NEW', 'RECEIVED', 'PENDING'].includes(status)
                                ? 'bg-orange-600 text-white animate-pulse'
                                : status === 'PREPARING'
                                ? 'bg-amber-600 text-white'
                                : status === 'READY_FOR_PICKUP'
                                ? 'bg-blue-600 text-white'
                                : status === 'HANDED_OVER'
                                ? 'bg-purple-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {status === 'PENDING' ? 'RECEIVED' : status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-2">
                          {order.items?.map((it, i) => (
                            <span key={i} className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60 text-[11px] font-semibold">
                              {it.quantity}x {it.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Stage Transitions */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="text-right mr-2 hidden sm:block">
                          <div className="font-black text-sm text-slate-900">₹{order.totalAmount}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{order.paymentMethod || 'COD'}</div>
                        </div>

                        {/* STAGE 1: RECEIVED -> PREPARING */}
                        {['NEW', 'RECEIVED', 'PENDING'].includes(status) && (
                          <button
                            onClick={() => handleAcknowledge(oid)}
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-[#064E3B] hover:bg-[#033B2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Accept & Cook</span>
                          </button>
                        )}

                        {/* STAGE 2: PREPARING -> READY_FOR_PICKUP */}
                        {status === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateStatus(oid, 'READY_FOR_PICKUP')}
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Mark Ready for Pickup</span>
                          </button>
                        )}

                        {/* STAGE 3: READY_FOR_PICKUP -> HANDED_OVER */}
                        {status === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() => handleUpdateStatus(oid, 'HANDED_OVER')}
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Hand Over to Courier</span>
                          </button>
                        )}

                        {/* STAGE 4: HANDED_OVER (Waiting for rider OTP delivery verification) */}
                        {status === 'HANDED_OVER' && (
                          <span className="inline-flex items-center space-x-1 text-purple-700 bg-purple-100 px-3 py-1.5 rounded-xl text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Awaiting Delivery OTP</span>
                          </span>
                        )}

                        {/* STAGE 5: DELIVERED */}
                        {status === 'DELIVERED' && (
                          <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Delivered & Settled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* QUICK INVENTORY OUT-OF-STOCK TOGGLES                           */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#FF6B00]" />
                <span>Quick Inventory & Out-of-Stock Controls</span>
              </h3>
              <p className="text-xs text-slate-500">
                Immediately mark dishes or products out-of-stock to prevent customer orders during peak kitchen rush
              </p>
            </div>
            <NavLink
              to="/merchant/menu"
              className="text-xs font-bold text-[#064E3B] hover:underline flex items-center gap-1"
            >
              <span>Full Menu Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {products.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No catalog items available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((product) => {
                const isInStock = product.inStock !== false;
                return (
                  <div
                    key={product.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isInStock
                        ? 'bg-slate-50/60 border-slate-200'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            product.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {product.name}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-slate-800">₹{product.price}</span>
                        <span>•</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                    </div>

                    {/* Instant Switch Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleProductStock(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-2xs ${
                        isInStock
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                      title={isInStock ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                    >
                      {isInStock ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-red-500" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MerchantPortalLayout>
  );
}
