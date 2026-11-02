import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
import api from '../services/api';
import Logo from './Logo';
import NotificationModal from './NotificationModal';
import VernacularVoiceModal from './VernacularVoiceModal';
import soundService from '../services/soundService';
import {
  MapPin,
  Search,
  Mic,
  ShoppingBag,
  Repeat,
  Sparkles,
  Package,
  CalendarDays,
  Wrench,
  Globe,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Store,
  Bike,
  ShieldCheck,
  Check,
  Tag,
  X,
  Volume2,
  LifeBuoy,
  Settings,
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentCity, selectedLocality, setIsModalOpen } = useLocation();
  const { totalItemCount, total, setIsCartOpen } = useCart();
  const { user, isLoggedIn, logout, role } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Real-Time Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'init-1',
      title: 'Swagath Grand announced weekend special! 🍛',
      message: 'Authentic Hyderabadi Handi Dum Biryani + Free Shahi Double Ka Meetha!',
      discountCode: 'SWAGATHFREE',
      merchantName: 'Swagath Grand',
      merchantId: 'm-1',
      isRead: false,
      time: '10m ago',
    },
    {
      id: 'init-2',
      title: 'Niloufer Cafe: Fresh Evening Osmania Biscuits ☕',
      message: 'Hot Irani Dum Chai and melt-in-mouth Osmania biscuits ready for 15-min delivery.',
      merchantName: 'Niloufer Cafe',
      merchantId: 'm-9',
      isRead: false,
      time: '25m ago',
    },
  ]);

  // Live incoming Toast Popup banner
  const [liveToast, setLiveToast] = useState(null);

  // Fetch persisted notifications on login
  useEffect(() => {
    if (isLoggedIn) {
      api
        .get('/customers/notifications')
        .then((res) => {
          if (res.data.success && res.data.notifications?.length > 0) {
            setNotifications((prev) => {
              const combined = [...res.data.notifications, ...prev];
              // Unique by ID
              const seen = new Set();
              return combined.filter((item) => {
                const k = item.id;
                return seen.has(k) ? false : seen.add(k);
              });
            });
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  // Real-Time Socket Notification Listener
  useEffect(() => {
    const handleNewNotif = (notif) => {
      // Add to notifications list
      setNotifications((prev) => [notif, ...prev]);

      // Acoustic chime playback
      if (notif.type === 'order' || notif.orderId) {
        soundService.playOrderChime();
      } else if (notif.type === 'rider') {
        soundService.playRiderChirp();
      } else {
        soundService.playDealDing();
      }

      // Trigger floating live toast
      setLiveToast(notif);

      // Auto-dismiss toast in 5 seconds
      setTimeout(() => {
        setLiveToast((current) => (current?.id === notif.id ? null : current));
      }, 5000);
    };

    socket.on('notification:new', handleNewNotif);

    return () => {
      socket.off('notification:new', handleNewNotif);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('manamart_lang', nextLang);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container-high/60 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
            
            {/* Brand Logo & Location Pill */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
              <Logo size="md" to="/" />

              {/* Location Selector Pill */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all text-left"
              >
                <div className="w-5 h-5 rounded-full bg-secondary-container/15 text-secondary-container flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-secondary-container" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-on-surface line-clamp-1">{selectedLocality}</span>
                    <ChevronDown className="w-3 h-3 text-on-surface-variant" />
                  </div>
                  <span className="text-[10px] text-on-surface-variant line-clamp-1">{currentCity}</span>
                </div>
              </button>
            </div>

            {/* Desktop Centered & Responsive Search Bar */}
            <div className="hidden md:flex flex-1 min-w-[220px] max-w-xl mx-2 lg:mx-4 items-center">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full flex items-center bg-white rounded-full shadow-xs border border-slate-200 hover:border-slate-300 focus-within:border-[#064E3B] focus-within:ring-2 focus-within:ring-[#064E3B]/10 px-3 py-1.5 transition-all"
              >
                {/* Single Search Icon on Left */}
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />

                {/* Spacious Text Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder') || 'Search biryani, groceries, medicines...'}
                  className="w-full min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none py-0.5"
                />

                {/* Clear button if query present */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-700 mr-1 shrink-0 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Vernacular Voice AI Trigger */}
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="p-1.5 text-[#FF6B00] hover:text-[#e05e00] hover:bg-orange-50 rounded-full transition-all shrink-0 cursor-pointer active:scale-95"
                  title="Voice Ordering in Telugu / English (మాట్లాడి ఆర్డర్ చేయండి)"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Sleek Submit Button */}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-full text-xs font-bold transition-all shrink-0 shadow-2xs active:scale-95 ml-1 cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Action Icons & Utilities */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              
              {/* Language Switcher Pill */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-outline-variant/30 hover:border-primary text-xs font-bold text-on-surface bg-surface-container hover:bg-surface-container-high transition-all"
                title="Toggle English / తెలుగు"
              >
                <Globe className="w-3.5 h-3.5 text-secondary-container" />
                <span>{i18n.language === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              {/* Real-Time Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl border border-outline-variant/30 hover:border-secondary-container bg-surface-container text-on-surface hover:text-secondary-container transition-all"
                  title="Notifications & Updates from Followed Shops"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary-container text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Center Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Followed Shops & Updates
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            setIsNotificationModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-orange-600 hover:underline"
                        >
                          View All
                        </button>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[11px] font-bold text-[#006837] hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-slate-400">
                          No notifications yet. Follow neighborhood shops to receive instant daily updates!
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-2xl border transition-all space-y-1.5 ${
                              notif.isRead
                                ? 'bg-slate-50/60 border-slate-100 text-slate-600'
                                : 'bg-orange-50/50 border-orange-200 text-slate-900 font-semibold'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#006837] flex items-center space-x-1">
                                <Store className="w-3.5 h-3.5" />
                                <span>{notif.merchantName || 'Neighborhood Shop'}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">{notif.time || 'Just now'}</span>
                            </div>

                            <p className="text-xs leading-snug">{notif.message || notif.title}</p>

                            {notif.discountCode && (
                              <div className="inline-flex items-center space-x-1 bg-white px-2 py-0.5 rounded-md border border-orange-200 text-[#FF5A00] font-mono text-[10px] font-bold">
                                <Tag className="w-3 h-3" />
                                <span>Code: {notif.discountCode}</span>
                              </div>
                            )}

                            {notif.merchantId && (
                              <div className="pt-1">
                                <Link
                                  to={`/store/${notif.merchantId}`}
                                  onClick={() => setNotifDropdownOpen(false)}
                                  className="text-[11px] font-bold text-[#FF5A00] hover:underline inline-block"
                                >
                                  View Store Menu →
                                </Link>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Web Audio V2.4
                      </span>
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="font-bold text-[#055c24] hover:text-[#004217] hover:underline flex items-center gap-0.5"
                      >
                        <span>Audio Console & Specs</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account / Sign In Dropdown */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50/50 text-xs font-bold text-slate-800 transition-all shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#006837] text-white flex items-center justify-center text-[10px] font-black">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[70px] sm:max-w-[100px] truncate">
                      {user?.name ? user.name.split(' ')[0] : 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50 text-xs font-medium space-y-1">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{role} Account</p>
                      </div>

                      <Link
                        to="/app"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#FF5A00]" />
                        <span>Marketplace Store</span>
                      </Link>

                      {/* Only Show Merchant Portal If User is an actual Merchant */}
                      {role?.toUpperCase() === 'MERCHANT' && (
                        <Link
                          to="/merchant/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Store className="w-4 h-4 text-[#064E3B]" />
                          <span>Merchant Workspace</span>
                        </Link>
                      )}

                      {/* Only Show Rider Portal If User is an actual Rider */}
                      {role?.toUpperCase() === 'RIDER' && (
                        <Link
                          to="/rider/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Bike className="w-4 h-4 text-[#FF6B00]" />
                          <span>Delivery Hero Console</span>
                        </Link>
                      )}

                      {/* Admin Console */}
                      {role?.toUpperCase() === 'ADMIN' && (
                        <Link
                          to="/admin/analytics"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Platform Governance</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>My Profile & Wallet</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/support"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LifeBuoy className="w-4 h-4 text-purple-600" />
                        <span>Help & Support</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left font-bold"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-primary/40 hover:border-primary bg-surface-container-lowest text-xs font-bold text-primary transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden lg:inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Cart Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-1.5 bg-secondary-container hover:bg-secondary text-on-primary px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs transition-all"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] sm:text-xs font-bold leading-tight">
                    {totalItemCount > 0 ? `${totalItemCount} Items` : t('nav.cart')}
                  </span>
                  {totalItemCount > 0 && (
                    <span className="text-[10px] font-semibold text-secondary-fixed leading-none">
                      ₹{total}
                    </span>
                  )}
                </div>
                {totalItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-surface-container-lowest text-secondary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-secondary shadow-xs animate-pulse">
                    {totalItemCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="pb-3 pt-1 md:hidden">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 px-3 py-1.5 focus-within:border-primary"
            >
              <Search className="w-4 h-4 text-outline mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder') || 'Search biryani, groceries, medicines...'}
                className="w-full min-w-0 flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none truncate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-outline hover:text-on-surface mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Vernacular Voice AI Trigger */}
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="p-1.5 text-[#fe6b00] hover:text-[#d45800] rounded-full transition-all shrink-0 cursor-pointer mr-1"
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#fe6b00] to-[#fd5a05] hover:opacity-95 text-white rounded-xl text-xs font-bold shrink-0 ml-0.5 shadow-xs flex items-center gap-1 active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* Hyperlocal Category & Quick Service Ribbon (Desktop) */}
        <div className="hidden md:block bg-surface-container-low/70 border-t border-outline-variant/20 py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-6">
              <Link
                to={isLoggedIn ? "/reservations" : "/login"}
                state={{ from: { pathname: "/reservations" }, message: "Please sign in or choose a demo login to book a dining table." }}
                className="flex items-center space-x-1.5 text-secondary hover:text-secondary-container transition-colors group"
              >
                <div className="w-5 h-5 rounded-md bg-secondary-container/15 flex items-center justify-center text-secondary-container group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <span>Book Restaurant Table</span>
              </Link>

              <Link to="/feed" className="flex items-center space-x-1.5 text-on-surface-variant hover:text-primary transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#fe6b00]" />
                <span>{t('nav.feed')}</span>
              </Link>

              <Link to="/recurring" className="flex items-center space-x-1.5 text-on-surface-variant hover:text-primary transition-colors">
                <Repeat className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.recurring')}</span>
              </Link>

              <Link to="/parcel" className="flex items-center space-x-1.5 text-on-surface-variant hover:text-primary transition-colors">
                <Package className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.parcel')}</span>
              </Link>

              <Link to="/services" className="flex items-center space-x-1.5 text-on-surface-variant hover:text-primary transition-colors">
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span>Local Services</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Delivering in {selectedLocality}, {currentCity}
              </span>
              <span>•</span>
              <Link to="/support" className="hover:text-primary transition-colors">
                24x7 Help Desk
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Real-Time Floating Notification Toast Banner */}
      {liveToast && (
        <div className="fixed top-24 right-4 z-50 max-w-sm w-full bg-white rounded-3xl p-4 shadow-2xl border-2 border-[#FF5A00] animate-in slide-in-from-top-4 duration-300 flex items-start space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5A00] flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#006837]">{liveToast.merchantName || 'Followed Shop'}</span>
              <button
                onClick={() => setLiveToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{liveToast.title}</p>
            <p className="text-[11px] text-slate-500 leading-tight">{liveToast.message}</p>
          </div>
        </div>
      )}
      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* Vernacular Voice AI Ordering Modal (Telugu + English) */}
      <VernacularVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </>
  );
}
