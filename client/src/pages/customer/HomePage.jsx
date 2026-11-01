import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import ManaAIScout from '../../components/ManaAIScout';
import {
  Sparkles,
  Clock,
  Star,
  MapPin,
  Plus,
  Repeat,
  Package,
  ShieldCheck,
  Check,
  Utensils,
  ShoppingBag,
  Pill,
  Cake,
  Flower2,
  Wrench,
  ChevronRight,
  Flame,
  Bot,
} from 'lucide-react';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { currentCity, selectedLocality, coordinates } = useLocation();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [merchants, setMerchants] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);

  // Category Icon map
  const iconMap = {
    all: Sparkles,
    food: Utensils,
    kirana: ShoppingBag,
    pharmacy: Pill,
    bakery: Cake,
    flowers: Flower2,
    parcel: Package,
    services: Wrench,
  };

  useEffect(() => {
    fetchData();
  }, [coordinates, activeCategory, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, merchRes, feedRes] = await Promise.all([
        api.get('/discovery/categories'),
        api.get('/discovery/nearby', {
          params: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            category: activeCategory !== 'all' ? activeCategory : undefined,
            search: searchQuery || undefined,
          },
        }),
        api.get('/follows/feed'),
      ]);

      if (catsRes.data.success) setCategories(catsRes.data.categories);
      if (merchRes.data.success) setMerchants(merchRes.data.merchants);
      if (feedRes.data.success) setStories(feedRes.data.posts);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (e, merchantId, isFollowed) => {
    e.stopPropagation();
    try {
      if (isFollowed) {
        await api.delete(`/follows/${merchantId}`);
      } else {
        await api.post(`/follows/${merchantId}`);
      }
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId
            ? {
                ...m,
                isFollowed: !isFollowed,
                followersCount: isFollowed ? m.followersCount - 1 : m.followersCount + 1,
              }
            : m
        )
      );
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const filteredMerchants = vegOnly ? merchants.filter((m) => m.pureVeg) : merchants;

  return (
    <div className="min-h-screen pb-24 md:pb-12 space-y-6 sm:space-y-8">
      
      {/* Hero Welcome Banner with Official ManaMart Colors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-r from-[#006837] via-[#0A7A3E] to-[#FF5A00] text-white p-6 sm:p-10 shadow-xl shadow-orange-500/10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{i18n.language === 'te' ? 'మీ పరిసరాల మార్కెట్' : 'Hyperlocal 15-Minute Neighborhood Network'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {i18n.language === 'te' ? 'మన ఊరు. మన మార్కెట్.' : 'Mana Ooru. Mana Market.'}
              <span className="block text-amber-200 text-lg sm:text-2xl lg:text-3xl font-extrabold mt-1">
                Your Entire Neighborhood, Delivered.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg font-medium mx-auto lg:mx-0">
              Order authentic food, daily kirana ration, urgent 24x7 medicines, sweets, fresh flowers & book local services in {selectedLocality}, {currentCity}.
            </p>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-2.5">
              <Link
                to="/recurring"
                className="inline-flex items-center space-x-2 bg-white text-[#006837] hover:bg-emerald-50 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all"
              >
                <Repeat className="w-4 h-4 text-[#FF5A00]" />
                <span>{t('home.recurringBannerBtn')}</span>
              </Link>
              <Link
                to="/parcel"
                className="inline-flex items-center space-x-2 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl font-bold text-xs border border-white/20 transition-all"
              >
                <Package className="w-4 h-4 text-amber-300" />
                <span>Send Hyperlocal Parcel</span>
              </Link>
            </div>
          </div>

          {/* Official Logo Display Artwork on Hero */}
          <div className="relative z-10 flex-shrink-0 bg-white/95 backdrop-blur-md p-3.5 sm:p-5 rounded-3xl shadow-xl border border-white/60 hidden sm:block">
            <img
              src="/logo.png"
              alt="ManaMart Logo"
              className="h-24 sm:h-28 lg:h-32 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Live AI Neighborhood Scout & Interactive GPS Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ManaAIScout />
      </section>

      {/* Stories / Local Shop Updates Bar (Instagram / YouTube inspired) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {t('home.storiesTitle')}
            </h2>
          </div>
          <Link to="/feed" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stories Horizontal Scroll */}
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
          {stories.map((story) => (
            <Link
              key={story.id}
              to="/feed"
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer text-center w-18"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-orange-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                  <img
                    src={story.merchantLogo || story.imageUrl}
                    alt={story.merchantName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-800 line-clamp-1 mt-1 group-hover:text-orange-600">
                {story.merchantName.split(' ')[0]}
              </span>
              <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wider">
                {story.tag.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Icons Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mb-3 tracking-tight">
          {t('home.categoriesTitle')}
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3.5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.id] || Sparkles;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'parcel') navigate('/parcel');
                  else if (cat.id === 'services') navigate('/services');
                  else setActiveCategory(cat.id);
                }}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center group ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md scale-102 ring-2 ring-orange-200'
                    : 'bg-white hover:bg-orange-50/50 text-slate-700 border-slate-200/80 hover:border-orange-200 shadow-2xs'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold line-clamp-1">
                  {i18n.language === 'te' && cat.teluguName ? cat.teluguName : cat.name}
                </span>
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                  {cat.count} shops
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Automated Recurring Shopping Banner Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 sm:p-7 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-700/50">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/30 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              <Repeat className="w-3.5 h-3.5" />
              <span>Smart Automated Neighborhood Subscription</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white">
              {t('home.recurringBannerTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
              {t('home.recurringBannerSub')}
            </p>
          </div>
          <Link
            to="/recurring"
            className="flex-shrink-0 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition-all flex items-center space-x-2"
          >
            <span>Create Auto-List</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Main Neighborhood Stores Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              {t('home.nearbyShopsTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              Showing verified local businesses serving {selectedLocality}
            </p>
          </div>

          {/* Veg Only filter toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                vegOnly
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 animate-pulse space-y-3">
                <div className="h-44 bg-slate-200 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No merchants found in this category</h3>
            <p className="text-xs text-slate-500">Try switching categories or clear the search query.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setVegOnly(false);
              }}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                onClick={() => navigate(`/store/${merchant.id}`)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Store Banner Image */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                  <img
                    src={merchant.bannerImage}
                    alt={merchant.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {merchant.fssaiLicense && (
                      <span className="bg-white/95 backdrop-blur-md text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>FSSAI Verified</span>
                      </span>
                    )}
                    {merchant.drugLicense && (
                      <span className="bg-white/95 backdrop-blur-md text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>Drug License Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Follow Button on Banner */}
                  <button
                    onClick={(e) => handleFollowToggle(e, merchant.id, merchant.isFollowed)}
                    className={`absolute top-3 right-3 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md backdrop-blur-md transition-all flex items-center space-x-1 ${
                      merchant.isFollowed
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/90 hover:bg-white text-slate-800 hover:text-purple-600'
                    }`}
                  >
                    {merchant.isFollowed ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{t('store.following')}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>{t('store.follow')}</span>
                      </>
                    )}
                  </button>

                  {/* Bottom Image Metadata */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span className="font-bold">{merchant.estimatedDeliveryTime || '20-30 mins'}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-xl font-bold">
                      <MapPin className="w-3 h-3 text-orange-400" />
                      <span>{merchant.distanceKm || 1.8} km away</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {merchant.businessName}
                      </h3>
                      {/* Rating Badge */}
                      <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs font-black flex-shrink-0">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{merchant.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {merchant.tagline || merchant.description}
                    </p>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {merchant.address?.street}, {merchant.address?.locality}
                    </p>
                  </div>

                  {/* Card Footer tags */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-orange-600 uppercase text-[10px] tracking-wider bg-orange-50 px-2 py-0.5 rounded-md">
                      {merchant.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ₹{merchant.avgPriceForTwo || 300} for two
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

