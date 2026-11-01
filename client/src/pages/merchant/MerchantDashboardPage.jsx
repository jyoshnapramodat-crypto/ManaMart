import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Users,
  Star,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  FileText,
  Utensils,
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const { user } = useAuth();

  const [storeData, setStoreData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'posts' | 'compliance' | 'reservations'
  const [loading, setLoading] = useState(true);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Main Course');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdVeg, setNewProdVeg] = useState(true);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTag, setPostTag] = useState('daily_special');
  const [postCode, setPostCode] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  // Compliance doc form state
  const [fssaiInput, setFssaiInput] = useState('13619011000452');
  const [docSubmitted, setDocSubmitted] = useState(false);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    setLoading(true);
    try {
      const [storeRes, prodsRes, ordersRes, resRes] = await Promise.all([
        api.get('/merchants/my-store'),
        api.get('/merchants/products'),
        api.get('/merchants/orders'),
        api.get('/merchants/reservations'),
      ]);

      if (storeRes.data.success) {
        setStoreData(storeRes.data.store);
        setAnalytics(storeRes.data.analytics);
      }
      if (prodsRes.data.success) setProducts(prodsRes.data.products);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (resRes.data.success) setReservations(resRes.data.reservations);
    } catch (err) {
      console.error('Error fetching merchant dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStoreOpen = async () => {
    if (!storeData) return;
    const nextState = !storeData.isOpen;
    try {
      const res = await api.put('/merchants/my-store', { isOpen: nextState });
      if (res.data.success) {
        setStoreData((prev) => ({ ...prev, isOpen: nextState }));
      }
    } catch (err) {
      console.error('Failed to toggle store status:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleProductStock = async (prod) => {
    try {
      const res = await api.put(`/merchants/products/${prod.id}`, { inStock: !prod.inStock });
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, inStock: !prod.inStock } : p))
        );
      }
    } catch (err) {
      console.error('Stock toggle error:', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      const res = await api.post('/merchants/products', {
        name: newProdName,
        category: newProdCategory,
        price: Number(newProdPrice),
        isVeg: newProdVeg,
      });
      if (res.data.success) {
        setProducts((prev) => [res.data.product, ...prev]);
        setNewProdName('');
        setNewProdPrice('');
      }
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    try {
      const res = await api.post('/follows/posts', {
        title: postTitle,
        content: postContent,
        tag: postTag,
        discountCode: postCode || null,
      });
      if (res.data.success) {
        setPostSuccess(true);
        setPostTitle('');
        setPostContent('');
        setPostCode('');
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Post publish error:', err);
    }
  };

  const handleSubmitCompliance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/merchants/documents', {
        fssaiLicense: fssaiInput,
      });
      if (res.data.success) {
        setDocSubmitted(true);
        setStoreData((prev) => ({ ...prev, verificationStatus: 'pending' }));
      }
    } catch (err) {
      console.error('Doc error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500 animate-pulse">
        Loading Merchant Command Center...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Top Bar with Store Status Toggle */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg text-slate-900">
                {storeData?.businessName || 'My Neighborhood Store'}
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {storeData?.verificationStatus || 'Verified'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-bold uppercase text-orange-600">{storeData?.category}</span> • {storeData?.address?.locality}
            </p>
          </div>
        </div>

        {/* Live Store Online / Offline Toggle */}
        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold text-slate-700">
            Store Status: <span className={storeData?.isOpen ? 'text-emerald-600' : 'text-slate-400'}>
              {storeData?.isOpen ? 'ACCEPTING ORDERS' : 'STORE CLOSED'}
            </span>
          </span>
          <button
            onClick={handleToggleStoreOpen}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
              storeData?.isOpen
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-300 text-slate-700'
            }`}
          >
            {storeData?.isOpen ? 'Open' : 'Closed'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Today's Revenue</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">₹{analytics?.todayRevenue || 1420}</span>
          <span className="text-[10px] text-emerald-600 font-bold block">Settled to bank daily</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Active Orders</span>
          <span className="text-xl sm:text-2xl font-black text-orange-600">{orders.filter((o) => o.orderStatus !== 'delivered').length}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Kitchen preparing</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Shop Followers</span>
          <span className="text-xl sm:text-2xl font-black text-purple-600">{analytics?.followersCount || storeData?.followersCount || 1840}</span>
          <span className="text-[10px] text-purple-700 font-bold block">Subscribed customers</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-1">
          <span className="text-slate-400 text-xs font-semibold block">Customer Rating</span>
          <div className="flex items-center space-x-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{storeData?.rating || 4.8}</span>
            <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">Based on 1,420 orders</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none text-xs font-extrabold">
        {[
          { id: 'orders', label: `Live Orders (${orders.filter((o) => o.orderStatus !== 'delivered').length})`, icon: ShoppingBag },
          { id: 'products', label: `Menu & Inventory (${products.length})`, icon: Utensils },
          { id: 'posts', label: 'Create Post / Offer', icon: Sparkles },
          { id: 'reservations', label: `Reservations (${reservations.length})`, icon: CalendarDays },
          { id: 'compliance', label: 'License & Verification', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Live Orders Manager */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">Incoming Neighborhood Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs">
              No orders at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                const isReady = ['ready_for_pickup', 'out_for_delivery', 'delivered'].includes(order.orderStatus);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500">#{order.orderNumber}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{order.customerName}</h4>
                      </div>
                      <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    {/* Ordered items */}
                    <div className="text-xs space-y-1 text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.quantity} × {item.name}</span>
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Stage: <span className="text-orange-600 font-black">{order.orderStatus.replace(/_/g, ' ')}</span>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {order.orderStatus === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.orderStatus === 'preparing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'ready_for_pickup')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                          >
                            Mark Ready for Rider
                          </button>
                        )}
                        {isReady && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Handed to Rider</span>
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
      )}

      {/* Tab 2: Products & Inventory CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Add Product Form */}
          <form onSubmit={handleAddProduct} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Add New Dish / Product to Catalog</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Dish or item name (e.g. Mutton Keema Samosa)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
                >
                  <option value="Biryani & Rice">Biryani & Rice</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Starters & Snacks">Starters & Snacks</option>
                  <option value="Breads">Breads</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Provisions">Provisions</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="Price (₹)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white font-extrabold px-4 py-2 rounded-xl hover:bg-orange-700 whitespace-nowrap shadow-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Product Items Table */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Live Store Inventory ({products.length})</h3>
              <span className="text-xs text-slate-400">Toggle switch to mark Out-of-Stock</span>
            </div>

            <div className="divide-y divide-slate-100">
              {products.map((prod) => (
                <div key={prod.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                          {prod.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{prod.name}</h4>
                      <span className="text-[10px] text-slate-400">{prod.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-black text-slate-900 text-sm">₹{prod.price}</span>
                    <button
                      onClick={() => handleToggleProductStock(prod)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        prod.inStock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {prod.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Create Social Update / Offer */}
      {activeTab === 'posts' && (
        <form onSubmit={handlePublishPost} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Publish Post to Followers</h3>
            <span className="text-xs text-purple-600 font-bold">1,840 Followers will be notified</span>
          </div>

          {postSuccess && (
            <div className="p-3 bg-purple-50 text-purple-900 rounded-2xl border border-purple-200 text-xs font-bold">
              Post broadcasted to all followers successfully!
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Post Headline</label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="e.g. Weekend Dum Biryani Special with Free Sweets!"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Post Details / Announcement</label>
              <textarea
                rows="3"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Describe the offer, fresh arrival, or special menu for today..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tag Category</label>
                <select
                  value={postTag}
                  onChange={(e) => setPostTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
                >
                  <option value="daily_special">Daily Special 🍛</option>
                  <option value="new_arrival">New Arrival 🌾</option>
                  <option value="offer">Flash Offer 🏷️</option>
                  <option value="stock_update">Stock Alert 🍪</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discount Promo Code</label>
                <input
                  type="text"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  placeholder="e.g. SWAGATH10"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none uppercase font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md transition-all"
            >
              Broadcast Post to All Followers
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Reservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Confirmed Dine-In Table Bookings</h3>
          {reservations.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs">
              No dine-in reservations currently booked.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reservations.map((r) => (
                <div key={r.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{r.customerName}</h4>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-slate-600">Guests: <span className="font-bold">{r.partySize} People</span></p>
                  <p className="text-slate-600">Date & Slot: <span className="font-bold">{r.reservationDate} at {r.reservationTime}</span></p>
                  <p className="text-slate-400 italic">"{r.specialRequests || 'Standard dining table'}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Mandatory Regulatory Compliance Checklist */}
      {activeTab === 'compliance' && (
        <div className="max-w-xl bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Mandatory Merchant License Verification</h3>
          </div>

          <p className="text-xs text-slate-500">
            Per Government & Food Safety regulations, all food businesses on ManaMart must maintain active FSSAI accreditation, and pharmacies must hold verified Drug Licenses.
          </p>

          <form onSubmit={handleSubmitCompliance} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">14-Digit FSSAI License Number</label>
              <input
                type="text"
                value={fssaiInput}
                onChange={(e) => setFssaiInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                defaultValue="36AAACR1234F1Z8"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Business PAN Card</label>
              <input
                type="text"
                defaultValue="APXPR1294K"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
              />
            </div>

            {docSubmitted && (
              <p className="text-emerald-600 font-bold">
                Verification documents re-submitted for Admin audit checklist.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md"
            >
              Submit Compliance Documents for Audit
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

