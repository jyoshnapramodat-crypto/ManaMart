import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DocumentUploadInput from '../../components/DocumentUploadInput';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Users,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  FileText,
  Utensils,
  Tag,
  Trash2,
  Edit3,
  Search,
  TrendingUp,
  Image as ImageIcon,
  Check,
  Package,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [storeData, setStoreData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product modal / form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Main Course');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodIsVeg, setProdIsVeg] = useState(true);
  const [prodInStock, setProdInStock] = useState(true);
  const [prodImageDoc, setProdImageDoc] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  // Post publishing form state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTag, setPostTag] = useState('daily_special');
  const [postCode, setPostCode] = useState('');
  const [postIsDraft, setPostIsDraft] = useState(false);
  const [postImageDoc, setPostImageDoc] = useState(null);
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Promotion form state
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState('percentage');
  const [promoDiscountVal, setPromoDiscountVal] = useState('15');
  const [promoMinOrder, setPromoMinOrder] = useState('199');
  const [promoExpiry, setPromoExpiry] = useState('');
  const [promoSubmitting, setPromoSubmitting] = useState(false);

  // Order status filter
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [storeRes, prodsRes, ordersRes, postsRes, promosRes, followersRes] = await Promise.all([
        api.get('/merchants/my-store').catch(() => ({ data: {} })),
        api.get('/merchants/products').catch(() => ({ data: {} })),
        api.get('/merchants/orders').catch(() => ({ data: {} })),
        api.get('/merchants/posts').catch(() => ({ data: {} })),
        api.get('/merchants/promotions').catch(() => ({ data: {} })),
        api.get('/merchants/followers').catch(() => ({ data: {} })),
      ]);

      if (storeRes.data?.success) {
        setStoreData(storeRes.data.store);
        setAnalytics(storeRes.data.analytics);
      }
      if (prodsRes.data?.success) setProducts(prodsRes.data.products || []);
      if (ordersRes.data?.success) setOrders(ordersRes.data.orders || []);
      if (postsRes.data?.success) setPosts(postsRes.data.posts || []);
      if (promosRes.data?.success) setPromotions(promosRes.data.promotions || []);
      if (followersRes.data?.success) setFollowers(followersRes.data.followers || []);
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
      console.error('Failed to update order status:', err);
    }
  };

  // Product Save / Edit
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName,
        category: prodCategory,
        price: parseFloat(prodPrice),
        description: prodDesc,
        isVeg: prodIsVeg,
        inStock: prodInStock,
        imageUrl: prodImageDoc?.fileUrl || undefined,
      };

      if (editingProductId) {
        const res = await api.put(`/merchants/products/${editingProductId}`, payload);
        if (res.data.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProductId ? res.data.product : p))
          );
        }
      } else {
        const res = await api.post('/merchants/products', payload);
        if (res.data.success) {
          setProducts((prev) => [res.data.product, ...prev]);
        }
      }

      setShowProductModal(false);
      resetProductForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from your catalog?')) return;
    try {
      const res = await api.delete(`/merchants/products/${id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdDesc(prod.description || '');
    setProdIsVeg(prod.isVeg ?? true);
    setProdInStock(prod.inStock ?? true);
    if (prod.imageUrl) {
      setProdImageDoc({ fileUrl: prod.imageUrl, fileName: 'product-image' });
    } else {
      setProdImageDoc(null);
    }
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('Main Course');
    setProdPrice('');
    setProdDesc('');
    setProdIsVeg(true);
    setProdInStock(true);
    setProdImageDoc(null);
  };

  // Post Publishing
  const handlePublishPost = async (e) => {
    e.preventDefault();
    setPostSubmitting(true);
    try {
      const payload = {
        title: postTitle,
        content: postContent,
        tag: postTag,
        discountCode: postCode || undefined,
        imageUrl: postImageDoc?.fileUrl || undefined,
        isDraft: postIsDraft,
      };

      const res = await api.post('/merchants/posts', payload);
      if (res.data.success) {
        setPosts((prev) => [res.data.post, ...prev]);
        setShowPostModal(false);
        setPostTitle('');
        setPostContent('');
        setPostCode('');
        setPostImageDoc(null);
        setPostIsDraft(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing post');
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Remove this post from your feed?')) return;
    try {
      const res = await api.delete(`/merchants/posts/${id}`);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  // Promotion Create
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setPromoSubmitting(true);
    try {
      const payload = {
        code: promoCode.toUpperCase().trim(),
        title: promoTitle,
        description: promoDesc,
        discountType: promoDiscountType,
        discountValue: parseFloat(promoDiscountVal),
        minOrderValue: parseFloat(promoMinOrder),
        endDate: promoExpiry ? new Date(promoExpiry).toISOString() : undefined,
      };

      const res = await api.post('/merchants/promotions', payload);
      if (res.data.success) {
        setPromotions((prev) => [res.data.promotion, ...prev]);
        setShowPromoModal(false);
        setPromoCode('');
        setPromoTitle('');
        setPromoDesc('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    } finally {
      setPromoSubmitting(false);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter((o) => o.orderStatus === 'pending').length },
    { id: 'products', label: 'Products & Inventory', icon: Utensils, badge: products.length },
    { id: 'posts', label: 'Posts & Updates', icon: Sparkles, badge: posts.length },
    { id: 'promotions', label: 'Promotions & Coupons', icon: Tag },
    { id: 'followers', label: 'Followers', icon: Users, badge: followers.length },
    { id: 'mystore', label: 'My Store Details', icon: Store },
    { id: 'verification', label: 'Verification & Docs', icon: ShieldCheck },
  ];

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    return (
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  });

  return (
    <DashboardLayout
      role="merchant"
      title={storeData?.name || 'Merchant Console'}
      subtitle={storeData?.address?.locality ? `${storeData.address.locality}, ${storeData.address.city}` : 'Manage catalog, orders & promotions'}
      sidebarItems={sidebarItems}
      activeItem={activeTab}
      onSelect={setActiveTab}
      headerActions={
        storeData && (
          <button
            onClick={handleToggleStoreOpen}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-pointer ${
              storeData.isOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {storeData.isOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{storeData.isOpen ? 'STORE OPEN' : 'STORE CLOSED'}</span>
          </button>
        )
      }
    >
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#064E3B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading merchant dashboard metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Gross Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{analytics?.totalRevenue || 0}
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold">Real database settlements</span>
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
                  <span className="text-[11px] text-[#FF6B00] font-bold">
                    {orders.filter((o) => o.orderStatus === 'pending').length} pending action
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Active Products</span>
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{products.length}</div>
                  <span className="text-[11px] text-slate-500 font-medium">In your store catalog</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Customer Followers</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{followers.length}</div>
                  <span className="text-[11px] text-purple-700 font-bold">Receiving instant updates</span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No orders received yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="font-bold text-slate-800">Order #{order.id?.slice(-6)}</div>
                          <div className="text-slate-500 text-[11px]">
                            {order.items?.length || 1} items • ₹{order.totalAmount} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {order.orderStatus?.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['all', 'pending', 'preparing', 'out_for_delivery', 'delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                        orderFilter === st
                          ? 'bg-[#064E3B] text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-semibold">{filteredOrders.length} Orders</span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
                  No orders match this filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900">Order #{order.id}</span>
                          <p className="text-[11px] text-slate-400">
                            Placed {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-base text-slate-900">₹{order.totalAmount}</span>
                          <p className="text-[10px] text-slate-500 uppercase">{order.paymentMethod || 'COD'}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-xs space-y-1 text-slate-700">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-mono">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order status actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          Status: {order.orderStatus?.replace('_', ' ')}
                        </span>

                        <div className="flex items-center gap-2">
                          {order.orderStatus === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className="px-3 py-1 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Accept & Prepare
                            </button>
                          )}
                          {order.orderStatus === 'preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                              className="px-3 py-1 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Ready for Pickup
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search your menu items or kirana goods..."
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs focus:border-[#064E3B] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={() => {
                    resetProductForm();
                    setShowProductModal(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#064E3B] hover:bg-[#033B2D] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center space-y-2">
                  <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No products found</p>
                  <p className="text-[11px] text-slate-400">Add food items, groceries, or pharmaceuticals to your live shop.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {p.imageUrl && (
                          <div className="w-full h-32 rounded-2xl bg-slate-100 overflow-hidden">
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.category}</span>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{p.name}</h4>
                          </div>
                          <span className={`w-3.5 h-3.5 rounded-sm border p-0.5 shrink-0 flex items-center justify-center ${
                            p.isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          </span>
                        </div>
                        {p.description && <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900">₹{p.price}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-[#064E3B] hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: POSTS & UPDATES */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Social-Commerce Updates & Stories</h3>
                  <p className="text-xs text-slate-500">Publish daily specials and stock arrivals directly into followed neighbors' feeds</p>
                </div>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Update</span>
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No updates published yet</p>
                  <p className="text-[11px] text-slate-400">Keep neighborhood customers engaged by posting daily specials or restock announcements.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {post.imageUrl && (
                          <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            {post.tag?.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900">{post.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                        {post.discountCode && (
                          <div className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                            <Tag className="w-3 h-3" />
                            <span>CODE: {post.discountCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">{post.likesCount || 0} Likes</span>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
                        >
                          Delete Post
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROMOTIONS & OFFERS */}
          {activeTab === 'promotions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Discount Coupons & Offers</h3>
                  <p className="text-xs text-slate-500">Configure checkout promo codes to incentivize larger cart sizes</p>
                </div>
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#064E3B] hover:bg-[#033B2D] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {promotions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
                  No promotional coupons active. Create your first discount offer above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {promotions.map((pr) => (
                    <div
                      key={pr.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-black text-[#FF6B00] bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                          {pr.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">{pr.title}</h4>
                      <p className="text-xs text-slate-500">{pr.description}</p>
                      <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100 flex justify-between">
                        <span>Discount: {pr.discountValue}{pr.discountType === 'percentage' ? '%' : ' Flat'}</span>
                        <span>Min Order: ₹{pr.minOrderValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FOLLOWERS */}
          {activeTab === 'followers' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Your Neighborhood Followers</h3>
              <p className="text-xs text-slate-500">These neighbors follow your store to receive live restock alerts and stories in real-time.</p>

              {followers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No followers yet. Promote your store link in your neighborhood!</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {followers.map((f, i) => (
                    <div key={i} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold">
                          {f.name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{f.name || 'Local Shopper'}</div>
                          <div className="text-[11px] text-slate-400">Following since {new Date(f.followedAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Active Neighbor
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MY STORE DETAILS */}
          {activeTab === 'mystore' && storeData && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-slate-900">Store Profile & Operating Timings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Business Name</span>
                  <p className="font-black text-sm text-slate-900">{storeData.name}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Category</span>
                  <p className="font-black text-sm text-slate-900 capitalize">{storeData.category}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Physical Address</span>
                  <p className="font-medium text-slate-800">
                    {storeData.address?.street}, {storeData.address?.locality}, {storeData.address?.city} - {storeData.address?.pincode}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Operating Hours</span>
                  <p className="font-medium text-slate-800">{storeData.openTime} – {storeData.closeTime}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: VERIFICATION & DOCUMENTS */}
          {activeTab === 'verification' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Governance & Regulatory Status</h3>
                  <p className="text-xs text-slate-500">Audited compliance records under Food Safety and Municipal Trade bylaws</p>
                </div>
                <button
                  onClick={() => navigate('/merchant/status')}
                  className="text-xs font-bold text-[#FF6B00] hover:underline"
                >
                  View Full Status Page →
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#064E3B]">Store Status: VERIFIED & ACTIVE</h4>
                  <p className="text-xs mt-0.5 text-emerald-800">
                    Your trade documentation, government identification, and category compliance licenses are verified.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Special Chicken Biryani / Sona Masoori Rice (25kg)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:border-[#064E3B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="e.g. Main Course, Dairy, Grains"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:border-[#064E3B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="249"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:border-[#064E3B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Freshly prepared, serves 1-2..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:border-[#064E3B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsVeg}
                    onChange={(e) => setProdIsVeg(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">100% Vegetarian</span>
                </label>
                <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">Currently in Stock</span>
                </label>
              </div>

              <DocumentUploadInput
                label="Product Photograph"
                description="Upload clean picture of item (JPG/PNG)"
                docType="product_image"
                value={prodImageDoc}
                onChange={setProdImageDoc}
              />

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST PUBLISHING MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Publish Store Story & Feed Update</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Freshly Baked Osmania Biscuits Straight From The Oven!"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:border-[#FF6B00] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Update Type</label>
                  <select
                    value={postTag}
                    onChange={(e) => setPostTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white focus:border-[#FF6B00] outline-none"
                  >
                    <option value="daily_special">🍛 Daily Special</option>
                    <option value="new_arrival">🌾 New Arrival</option>
                    <option value="stock_update">🍪 Stock Update</option>
                    <option value="offer">🏷️ Deals & Offers</option>
                    <option value="store_update">📢 Store Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Optional Promo Code</label>
                  <input
                    type="text"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                    placeholder="MANA10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Caption & Details *</label>
                <textarea
                  rows={3}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Tell your local customers about what is special today..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:border-[#FF6B00] outline-none"
                />
              </div>

              <DocumentUploadInput
                label="Post Media / Photograph"
                description="Upload an attractive picture of the food or products"
                docType="post_image"
                value={postImageDoc}
                onChange={setPostImageDoc}
              />

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  {postSubmitting ? <span>Publishing...</span> : <span>Publish to Feed</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Create Discount Coupon</h3>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="FESTIVE20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase font-mono focus:border-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={promoDiscountType}
                    onChange={(e) => setPromoDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promoDiscountVal}
                    onChange={(e) => setPromoDiscountVal(e.target.value)}
                    placeholder="20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={promoMinOrder}
                    onChange={(e) => setPromoMinOrder(e.target.value)}
                    placeholder="199"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. 20% OFF on Orders Above ₹199"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={promoExpiry}
                  onChange={(e) => setPromoExpiry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
