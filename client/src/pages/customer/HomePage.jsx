import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ManaAIScout from '../../components/ManaAIScout';
import TableReservationModal from '../../components/TableReservationModal';
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
  Filter,
} from 'lucide-react';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { currentCity, selectedLocality, coordinates } = useLocation();
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [merchants, setMerchants] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);

  // Table Reservation Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  const openTableBookingModal = (e, merchant) => {
    e.stopPropagation();
    setSelectedRestaurant(merchant);
    setBookingModalOpen(true);
  };

  const filteredMerchants = vegOnly ? merchants.filter((m) => m.pureVeg) : merchants;

  return (
    <div className="bg-surface min-h-screen pb-20 md:pb-12 space-y-6 sm:space-y-8 font-sans text-on-surface">
      {/* HERO WELCOME BANNER (Balanced proportions, warm colors) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-secondary-container text-on-primary p-5 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="relative z-10 max-w-xl space-y-2.5 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-surface-container-lowest/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
              <Sparkles className="w-3 h-3 text-secondary-fixed" />
              <span>
                {i18n.language === 'te'
                  ? 'మీ పరిసరాల మార్కెట్'
                  : 'Hyperlocal 15-Minute Neighborhood Network'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
              {i18n.language === 'te' ? 'మన ఊరు. మన మార్కెట్.' : 'Mana Ooru. Mana Market.'}
              <span className="block text-secondary-fixed text-sm sm:text-base lg:text-lg font-bold mt-0.5">
                Your Entire Neighborhood, Delivered in 20 Mins.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-tertiary-fixed-dim leading-relaxed max-w-md mx-auto md:mx-0">
              Order fresh veggies, authentic tiffins, 24x7 medicines, or reserve a dining table in {selectedLocality || 'Indiranagar'}, {currentCity || 'HYD'}.
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login', {
                      state: { from: { pathname: '/reservations' }, message: 'Please sign in or select a demo role to book restaurant dining tables.' },
                    });
                    return;
                  }
                  navigate('/reservations');
                }}
                className="inline-flex items-center space-x-1.5 bg-secondary-container hover:bg-secondary text-on-primary px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Book Restaurant Table</span>
              </button>
              <Link
                to="/recurring"
                className="inline-flex items-center space-x-1.5 bg-surface-container-lowest text-primary hover:bg-surface-container px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all"
              >
                <Repeat className="w-3.5 h-3.5 text-secondary" />
                <span>Monthly Auto-Lists</span>
              </Link>
              <Link
                to="/parcel"
                className="inline-flex items-center space-x-1.5 bg-primary/40 hover:bg-primary/60 backdrop-blur-md text-white px-3.5 py-2 rounded-xl font-bold text-xs border border-white/20 transition-all"
              >
                <Package className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>Send Local Parcel</span>
              </Link>
            </div>
          </div>

          {/* Logo Badge */}
          <div className="relative z-10 flex-shrink-0 bg-surface-container-lowest/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xs border border-white/40 hidden sm:block">
            <img
              src="/logo.png"
              alt="ManaMart Logo"
              className="h-16 sm:h-20 lg:h-24 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* MANAAI HYPERLOCAL SCOUT INTEGRATION */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <ManaAIScout />
      </section>

      {/* LIVE SHOP UPDATES / STORIES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></div>
            <h2 className="text-xs sm:text-sm font-bold text-primary tracking-tight">
              {t('home.storiesTitle') || 'Fresh Daily Updates from Shops'}
            </h2>
          </div>
          <Link
            to="/feed"
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Stories Horizontal Strip */}
        <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-none">
          {stories.map((story) => (
            <Link
              key={story.id}
              to="/feed"
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer text-center w-16"
            >
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-primary via-secondary to-secondary-container shadow-xs group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-surface-container-lowest p-[1.5px] overflow-hidden">
                  <img
                    src={story.merchantLogo || story.imageUrl}
                    alt={story.merchantName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-on-surface line-clamp-1 mt-1 group-hover:text-secondary">
                {story.merchantName.split(' ')[0]}
              </span>
              <span className="text-[8px] text-secondary font-bold uppercase tracking-wider">
                {story.tag?.replace('_', ' ') || 'Special'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES BENTO MODULE */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-primary tracking-tight">
            {t('home.categoriesTitle') || 'Shop by Neighborhood Category'}
          </h2>
          <span className="text-[11px] text-on-surface-variant">Tap to filter</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
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
                className={`flex flex-col items-center p-2.5 rounded-xl border transition-all text-center group ${
                  isSelected
                    ? 'bg-secondary-container text-on-primary border-secondary-container shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border-outline-variant/30 shadow-xs'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-container text-secondary-container'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold line-clamp-1">
                  {i18n.language === 'te' && cat.teluguName ? cat.teluguName : cat.name}
                </span>
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                  {cat.count} shops
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN NEARBY STORES GRID */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-primary tracking-tight">
              {t('home.nearbyShopsTitle') || 'Stores Serving Your Area'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              Showing verified local businesses serving {selectedLocality || 'Indiranagar'}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                vegOnly
                  ? 'bg-primary text-on-primary border-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary'
              }`}
            >
              <div className="w-3 h-3 border-2 border-emerald-600 rounded-xs flex items-center justify-center p-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
              </div>
              <span>Pure Veg Only</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/20 animate-pulse space-y-3"
              >
                <div className="aspect-[4/3] bg-surface-container rounded-lg"></div>
                <div className="h-4 bg-surface-container rounded w-3/4"></div>
                <div className="h-3 bg-surface-container rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-8 text-center space-y-2 border border-outline-variant/20">
            <div className="w-12 h-12 rounded-full bg-surface-container text-secondary flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-on-surface text-sm">No merchants found in this category</h3>
            <p className="text-xs text-on-surface-variant">Try switching categories or clear the search query.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setVegOnly(false);
              }}
              className="text-xs font-bold text-secondary-container hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                onClick={() => navigate(`/store/${merchant.id}`)}
                className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image with responsive aspect ratio */}
                  <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden bg-surface-container">
                    <img
                      src={merchant.bannerImage}
                      alt={merchant.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Status Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {merchant.fssaiLicense && (
                        <span className="bg-surface-container-lowest/95 backdrop-blur-sm text-primary font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center space-x-1 shadow-xs">
                          <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                          <span>FSSAI</span>
                        </span>
                      )}
                      {merchant.drugLicense && (
                        <span className="bg-surface-container-lowest/95 backdrop-blur-sm text-primary-container font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center space-x-1 shadow-xs">
                          <ShieldCheck className="w-2.5 h-2.5 text-primary-container" />
                          <span>Drug Lic</span>
                        </span>
                      )}
                    </div>

                    {/* Follow Toggle */}
                    <button
                      onClick={(e) => handleFollowToggle(e, merchant.id, merchant.isFollowed)}
                      className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-sm transition-all flex items-center space-x-1 ${
                        merchant.isFollowed
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-lowest/90 hover:bg-white text-on-surface'
                      }`}
                    >
                      {merchant.isFollowed ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-2.5 h-2.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    {/* Distance & ETA Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                      <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-secondary-fixed" />
                        <span className="font-semibold">{merchant.estimatedDeliveryTime || '20-30 mins'}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded font-semibold">
                        <MapPin className="w-3 h-3 text-secondary-container" />
                        <span>{merchant.distanceKm || 1.2} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-xs sm:text-sm text-primary group-hover:text-secondary-container transition-colors line-clamp-1">
                        {merchant.businessName}
                      </h3>
                      <div className="flex items-center space-x-0.5 bg-surface-container text-secondary px-1.5 py-0.5 rounded text-[11px] font-bold flex-shrink-0">
                        <Star className="w-2.5 h-2.5 fill-secondary text-secondary" />
                        <span>{merchant.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      {merchant.tagline || merchant.description}
                    </p>

                    <p className="text-[11px] text-outline line-clamp-1">
                      {merchant.address?.street}, {merchant.address?.locality}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 pt-0 border-t border-outline-variant/20 mt-2">
                  <div className="flex items-center justify-between text-[11px] pt-2 mb-2">
                    <span className="font-bold text-secondary uppercase text-[10px] bg-secondary-fixed/30 px-1.5 py-0.5 rounded">
                      {merchant.category}
                    </span>
                    <span className="text-on-surface-variant font-medium">
                      ₹{merchant.avgPriceForTwo || 250} for two
                    </span>
                  </div>

                  {/* Dual Action Buttons: Order Food vs Book Table */}
                  {merchant.hasTableBooking || merchant.category === 'food' ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/store/${merchant.id}`);
                        }}
                        className="py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs text-center transition-colors"
                      >
                        Order Online
                      </button>
                      <button
                        onClick={(e) => openTableBookingModal(e, merchant)}
                        className="py-1.5 px-2 rounded-lg bg-secondary-container hover:bg-secondary text-on-primary font-bold text-xs text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Utensils className="w-3 h-3" />
                        <span>Book Table</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/store/${merchant.id}`);
                      }}
                      className="w-full py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs text-center transition-colors"
                    >
                      View Store Catalog
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BookMyShow-style Interactive Restaurant Table Reservation Modal */}
      {bookingModalOpen && (
        <TableReservationModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedRestaurant(null);
          }}
          restaurant={selectedRestaurant}
        />
      )}
    </div>
  );
}
