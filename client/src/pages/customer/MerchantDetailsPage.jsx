import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  CalendarDays,
  Sparkles,
  ArrowLeft,
  Share2,
  Utensils,
} from 'lucide-react';
import TableReservationModal from '../../components/TableReservationModal';

export default function MerchantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { cartItems, addItem, updateQuantity, setIsCartOpen } = useCart();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuTab, setActiveMenuTab] = useState('All');
  const [vegFilter, setVegFilter] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  useEffect(() => {
    fetchMerchantDetails();
  }, [id]);

  const fetchMerchantDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/discovery/merchants/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load merchant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!data) return;
    const isFollowed = data.merchant.isFollowed;
    try {
      if (isFollowed) {
        await api.delete(`/follows/${id}`);
      } else {
        await api.post(`/follows/${id}`);
      }
      setData((prev) => ({
        ...prev,
        merchant: {
          ...prev.merchant,
          isFollowed: !isFollowed,
          followersCount: isFollowed
            ? prev.merchant.followersCount - 1
            : prev.merchant.followersCount + 1,
        },
      }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
        <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
      </div>
    );
  }

  if (!data || !data.merchant) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Shop Not Found</h3>
        <p className="text-xs text-slate-500">The requested merchant could not be located in this neighborhood.</p>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold bg-orange-600 text-white px-4 py-2 rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { merchant, products, menuCategories } = data;
  const categoriesList = ['All', ...Object.keys(menuCategories)];

  const displayedProducts = products.filter((p) => {
    if (activeMenuTab !== 'All' && p.category !== activeMenuTab) return false;
    if (vegFilter && !p.isVeg) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8F9FA]">
      
      {/* Top back navigation bar */}
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to stores</span>
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: merchant.businessName, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
          className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Merchant Hero Banner & Info Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl sm:rounded-4xl overflow-hidden border border-slate-100 shadow-soft">
          {/* Banner Image */}
          <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-900">
            <img
              src={merchant.bannerImage}
              alt={merchant.businessName}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* Badges on hero */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {merchant.fssaiLicense && (
                <span className="bg-white/95 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FSSAI Lic. #{merchant.fssaiLicense}</span>
                </span>
              )}
              {merchant.drugLicense && (
                <span className="bg-white/95 text-blue-800 font-extrabold text-xs px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Govt. Reg #{merchant.drugLicense}</span>
                </span>
              )}
            </div>

            {/* Timing Pill */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-3 text-white text-xs">
              <span className="bg-emerald-500/90 text-white font-extrabold px-2.5 py-1 rounded-xl flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{merchant.openTime} - {merchant.closeTime}</span>
              </span>
              <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{merchant.address.locality}, {merchant.address.city}</span>
              </span>
            </div>
          </div>

          {/* Details header */}
          <div className="p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {merchant.businessName}
                  </h1>
                </div>
                {merchant.teluguName && (
                  <p className="text-xs font-semibold text-orange-600 mt-0.5">
                    {merchant.teluguName}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  {merchant.description}
                </p>
              </div>

              {/* Follow Button & Table Reservation */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-sm ${
                    merchant.isFollowed
                      ? 'bg-purple-600 text-white ring-2 ring-purple-200'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  {merchant.isFollowed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('store.following')} ({merchant.followersCount})</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('store.follow')} ({merchant.followersCount})</span>
                    </>
                  )}
                </button>

                {merchant.hasTableBooking && (
                  <button
                    onClick={() => setIsReservationOpen(true)}
                    className="px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Book Table (Live Floor Plan)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                </div>
                <span>{merchant.rating} ({merchant.totalRatings || 450}+ reviews)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{merchant.deliveryTimeMin}-{merchant.deliveryTimeMax} mins delivery</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-normal">Approx:</span>
                <span>₹{merchant.avgPriceForTwo} for two</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Bar & Filters */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#F8F9FA]/95 backdrop-blur-md py-3 mt-4 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex space-x-2">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveMenuTab(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-extrabold transition-all whitespace-nowrap ${
                  activeMenuTab === cat
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setVegFilter(!vegFilter)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
              vegFilter
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
            }`}
          >
            <div className="w-3.5 h-3.5 border-2 border-emerald-500 rounded-sm flex items-center justify-center p-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
            <span>{t('store.vegOnly')}</span>
          </button>
        </div>
      </div>

      {/* Products Catalog Grid */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{activeMenuTab === 'All' ? 'Full Store Catalog' : activeMenuTab}</span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {displayedProducts.length} items
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProducts.map((product) => {
              const inCartItem = cartItems.find((ci) => ci.id === product.id);
              const qty = inCartItem ? inCartItem.quantity : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-card hover:shadow-md transition-all flex justify-between gap-4"
                >
                  {/* Left Info */}
                  <div className="flex-1 space-y-1.5">
                    {/* Veg / Non-Veg Indicator */}
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 border-2 rounded-xs flex items-center justify-center p-0.5 ${
                          product.isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            product.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        ></div>
                      </div>
                      {product.tags && product.tags[0] && (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          {product.tags[0]}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {product.name}
                    </h3>
                    {product.teluguName && (
                      <p className="text-[11px] font-semibold text-slate-500">
                        {product.teluguName}
                      </p>
                    )}

                    <div className="flex items-center space-x-2 pt-1">
                      <span className="font-black text-sm text-slate-900">₹{product.price}</span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                      )}
                      {product.unit && (
                        <span className="text-[10px] text-slate-400 font-medium">({product.unit})</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                      {product.description}
                    </p>
                  </div>

                  {/* Right Image + ADD Stepper */}
                  <div className="w-28 sm:w-32 flex flex-col items-center flex-shrink-0">
                    <div className="w-full h-24 rounded-2xl bg-slate-100 overflow-hidden relative shadow-xs">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                          {product.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Stepper or ADD Button */}
                    <div className="w-full -mt-4 z-10 px-1">
                      {qty > 0 ? (
                        <div className="w-full bg-white border border-orange-500 shadow-md rounded-xl py-1 px-2 flex items-center justify-between text-orange-600 font-black text-xs">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="p-1 hover:text-orange-800"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span>{qty}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="p-1 hover:text-orange-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(product, merchant)}
                          className="w-full bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs py-1.5 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-all"
                        >
                          {t('store.add')} +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BookMyShow Style Dine-In Table Reservation Modal */}
      <TableReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        restaurant={merchant}
      />

    </div>
  );
}

