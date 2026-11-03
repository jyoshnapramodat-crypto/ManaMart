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
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Image as ImageIcon,
  Eye,
  X,
  Tag,
} from 'lucide-react';

export default function MerchantDashboardView() {
  const [storeData, setStoreData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isRingtonePlaying, setIsRingtonePlaying] = useState(false);
  const [acknowledgedOrders, setAcknowledgedOrders] = useState(new Set());

  // Neighborhood Stories & Feed Publisher State
  const [showPostModal, setShowPostModal] = useState(false);
  const [inspectPreviewPost, setInspectPreviewPost] = useState(null);
  const [postTitle, setPostTitle] = useState('Freshly Made Gongura Mutton & Special Biryani!');
  const [postContent, setPostContent] = useState('Slow-cooked authentic batch prepared with pure cold-pressed oil and Guntur red chillies. Order now for hot 15-minute neighborhood delivery!');
  const [postTag, setPostTag] = useState('daily_special');
  const [postCode, setPostCode] = useState('MANA15');
  const [postImageUrl, setPostImageUrl] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80');
  const [postSubmitting, setPostSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();

    return () => {
      soundService.stopOrderRingtoneLoop();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [storeRes, ordersRes, productsRes, postsRes] = await Promise.all([
        api.get('/merchants/my-store'),
        api.get('/merchants/orders'),
        api.get('/merchants/products'),
        api.get('/merchants/posts').catch(() => api.get('/follows/feed')),
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
      if (postsRes.data?.success) {
        setPosts(postsRes.data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching merchant dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPost = async (e) => {
    e?.preventDefault();
    if (!postContent.trim()) {
      alert('Please enter a caption or description for your post.');
      return;
    }
    setPostSubmitting(true);
    try {
      const payload = {
        title: postTitle,
        caption: postContent,
        content: postContent,
        tag: postTag,
        discountCode: postCode || undefined,
        imageUrl: postImageUrl || undefined,
        images: postImageUrl ? [postImageUrl] : [],
      };

      const res = await api.post('/merchants/posts', payload);
      if (res.data?.success) {
        setPosts((prev) => [res.data.post, ...prev]);
        setShowPostModal(false);
        alert('🎉 Store update published! Customers in your area can now see this live in their feed and stories.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish post to feed');
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Remove this post from your public store feed?')) return;
    try {
      await api.delete(`/merchants/posts/${id}`).catch(() => {});
      setPosts((prev) => prev.filter((p) => p.id !== id && p.postId !== id));
      if (inspectPreviewPost?.id === id || inspectPreviewPost?.postId === id) {
        setInspectPreviewPost(null);
      }
    } catch (err) {
      console.error('Delete post error:', err);
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

        {/* ============================================================== */}
        {/* NEIGHBORHOOD STORIES & SOCIAL FEED PUBLISHER WITH LIVE PREVIEW */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Store Stories & Neighborhood Feed Publisher
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Customer Social Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish daily specials, restock announcements & flash discounts with instant real-time customer preview
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setInspectPreviewPost(null);
                setShowPostModal(true);
              }}
              className="self-start sm:self-auto px-4 py-2 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Create Story & Preview</span>
            </button>
          </div>

          {/* Active Published Stories Stream */}
          {posts.length === 0 ? (
            <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Stories or Updates Published Yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Keep nearby customers engaged! Publish your daily special dishes, fresh produce arrival, or flash discount codes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {posts.map((p) => {
                const pid = p.id || p.postId;
                return (
                  <div
                    key={pid}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                        <img
                          src={p.imageUrl || p.images?.[0] || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'}
                          alt={p.title || 'Store Post'}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-xs text-white">
                          {p.tag?.replace('_', ' ') || 'Special'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                          {p.title || p.caption || 'Special Daily Update'}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {p.caption || p.content}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {/* View Customer Preview Button */}
                      <button
                        type="button"
                        onClick={() => setInspectPreviewPost(p)}
                        className="font-bold text-[#FF6B00] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Customer Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(pid)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Delete post"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* POST PUBLISHING & LIVE REAL-TIME CUSTOMER PREVIEW STUDIO MODAL */}
        {/* ============================================================== */}
        {(showPostModal || inspectPreviewPost) && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
              
              {/* Modal Topbar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">
                      {inspectPreviewPost ? 'Customer Feed Post Preview' : 'Store Story & Feed Studio (Live Preview)'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {inspectPreviewPost
                        ? 'Simulating exact customer smartphone feed rendering'
                        : 'Review how this update appears on customer devices before publishing'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPostModal(false);
                    setInspectPreviewPost(null);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Split Viewport: Editor on Left, Live Customer Preview on Right */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
                
                {/* LEFT COLUMN: Post Editor Form (Only when creating, or edit mode) */}
                {!inspectPreviewPost ? (
                  <form onSubmit={handlePublishPost} className="lg:col-span-6 p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Headline / Dish Name *</label>
                      <input
                        type="text"
                        required
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="e.g. Freshly Baked Osmania Biscuits & Irani Chai!"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Story Tag</label>
                        <select
                          value={postTag}
                          onChange={(e) => setPostTag(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white focus:border-[#FF6B00] outline-none"
                        >
                          <option value="daily_special">🍛 Daily Special</option>
                          <option value="new_arrival">🌾 New Arrival</option>
                          <option value="stock_update">🍪 Stock Update</option>
                          <option value="offer">🏷️ Flash Deals & Offers</option>
                          <option value="store_update">📢 Store Notice</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Discount Coupon (Optional)</label>
                        <input
                          type="text"
                          value={postCode}
                          onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                          placeholder="MANA15"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:border-[#FF6B00] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Post Photo / Media URL</label>
                      <input
                        type="text"
                        value={postImageUrl}
                        onChange={(e) => setPostImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#FF6B00] outline-none text-[11px]"
                      />
                      {/* Quick Photo Presets */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Presets:</span>
                        {[
                          { label: '🍗 Dum Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
                          { label: '🌾 Fresh Groceries', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80' },
                          { label: '☕ Osmania Biscuits', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80' },
                          { label: '🥗 Organic Veggies', url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80' },
                        ].map((pr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPostImageUrl(pr.url)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Story Caption & Description *</label>
                      <textarea
                        rows={4}
                        required
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Describe the freshness, ingredients, spice level, or limited quantity availability..."
                        className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowPostModal(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={postSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#033B2D] text-white font-black shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                      >
                        {postSubmitting ? (
                          <span>Publishing...</span>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Publish to Feed</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="lg:col-span-5 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        PUBLISHED STORY DETAILS
                      </span>
                      <h4 className="font-black text-base text-slate-900 mt-2">
                        {inspectPreviewPost.title || inspectPreviewPost.caption?.slice(0, 40)}
                      </h4>
                      <p className="text-slate-500 mt-1 leading-relaxed">
                        {inspectPreviewPost.caption || inspectPreviewPost.content}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Broadcast Reach:</span>
                        <span className="font-bold text-emerald-800">1,840 Active Followers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Store Category:</span>
                        <span className="font-bold text-slate-800 capitalize">{inspectPreviewPost.tag?.replace('_', ' ')}</span>
                      </div>
                      {inspectPreviewPost.discountCode && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Voucher Code:</span>
                          <span className="font-mono font-bold text-[#FF6B00]">{inspectPreviewPost.discountCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectPreviewPost(null);
                          setShowPostModal(true);
                        }}
                        className="w-full py-2.5 bg-[#064E3B] text-white rounded-xl font-bold cursor-pointer hover:bg-[#033B2D]"
                      >
                        Create Another Post
                      </button>
                    </div>
                  </div>
                )}

                {/* RIGHT COLUMN: Real-Time Live Customer Smartphone Feed Card Preview */}
                <div className={`${inspectPreviewPost ? 'lg:col-span-7' : 'lg:col-span-6'} bg-slate-100 p-5 sm:p-8 flex flex-col items-center justify-center`}>
                  
                  {/* Smartphone Frame Simulation */}
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 px-2">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>LIVE CUSTOMER FEED VIEW</span>
                      </span>
                      <span>390px Mobile Port</span>
                    </div>

                    {/* Simulated Customer Post Card */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 transition-all">
                      
                      {/* Post Header */}
                      <div className="p-3.5 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#FF6B00] to-[#064E3B] shadow-xs">
                            <img
                              src={storeData?.logo || '/logo.png'}
                              alt="Store logo"
                              className="w-full h-full object-cover rounded-full bg-white"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="font-black text-xs text-slate-900 leading-tight">
                                {storeData?.name || 'Swagath Grand Kitchen'}
                              </span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Just now • {storeData?.address?.locality || 'Madhapur'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-[#FF6B00]">
                          {(inspectPreviewPost ? inspectPreviewPost.tag : postTag)?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Post Photograph */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={
                            (inspectPreviewPost ? (inspectPreviewPost.imageUrl || inspectPreviewPost.images?.[0]) : postImageUrl) ||
                            'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'
                          }
                          alt="Customer Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* Optional Promo Tag Overlay */}
                        {(inspectPreviewPost ? inspectPreviewPost.discountCode : postCode) && (
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-[#064E3B]/90 backdrop-blur-md text-white font-black text-[10px] flex items-center space-x-1 shadow-md">
                            <Tag className="w-3 h-3 text-[#FF6B00]" />
                            <span>CODE: {inspectPreviewPost ? inspectPreviewPost.discountCode : postCode}</span>
                          </div>
                        )}
                      </div>

                      {/* Post Content Details */}
                      <div className="p-4 space-y-2 text-xs">
                        <h4 className="font-black text-sm text-slate-900 leading-snug">
                          {inspectPreviewPost
                            ? (inspectPreviewPost.title || inspectPreviewPost.caption?.slice(0, 40))
                            : (postTitle || 'Fresh Daily Dish Ready For Order!')}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {inspectPreviewPost
                            ? (inspectPreviewPost.caption || inspectPreviewPost.content)
                            : (postContent || 'Tell your local customers about what is special today...')}
                        </p>

                        {/* Customer Action Bar */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-slate-400 text-xs">
                            <button type="button" className="flex items-center space-x-1 hover:text-red-500">
                              <Heart className="w-4 h-4" />
                              <span className="text-[10px] font-bold">14</span>
                            </button>
                            <button type="button" className="flex items-center space-x-1 hover:text-blue-500">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-[10px] font-bold">3</span>
                            </button>
                            <button type="button" className="hover:text-slate-700">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="px-3 py-1.5 bg-[#064E3B] text-white rounded-xl text-[10px] font-black shadow-xs flex items-center space-x-1">
                            <span>Order from Store</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}
      </div>
    </MerchantPortalLayout>
  );
}
