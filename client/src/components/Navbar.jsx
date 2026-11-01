import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
import api from '../services/api';
import Logo from './Logo';
import {
  MapPin,
  Search,
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
      navigate(`/app?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 shadow-level-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Brand Logo & Location Pill */}
            <div className="flex items-center space-x-3 sm:space-x-5 flex-shrink-0">
              <Logo size="md" to="/" />

              {/* Location Selector Pill */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-all text-left"
              >
                <div className="w-5 h-5 rounded-full bg-orange-500/10 text-[#FF5A00] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A00]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{selectedLocality}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{currentCity}</span>
                </div>
              </button>
            </div>

            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-md relative"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder') || 'Search Biryani, Milk, Medicine, Store...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm border border-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* Right Action Icons & Utilities */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Quick Links on Large Screens */}
              <div className="hidden lg:flex items-center space-x-3 text-xs font-semibold text-slate-600">
                <Link to="/feed" className="flex items-center space-x-1 hover:text-[#FF5A00] transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('nav.feed')}</span>
                </Link>
                <Link to="/recurring" className="flex items-center space-x-1 hover:text-[#006837] transition-colors">
                  <Repeat className="w-3.5 h-3.5 text-[#006837]" />
                  <span>{t('nav.recurring')}</span>
                </Link>
                <Link to="/parcel" className="flex items-center space-x-1 hover:text-[#FF5A00] transition-colors">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('nav.parcel')}</span>
                </Link>
              </div>

              {/* Language Switcher Pill */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 bg-white hover:bg-orange-50/50 transition-all shadow-2xs"
                title="Toggle English / తెలుగు"
              >
                <Globe className="w-3.5 h-3.5 text-[#FF5A00]" />
                <span>{i18n.language === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              {/* Real-Time Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl border border-slate-200 hover:border-orange-300 bg-white text-slate-700 hover:text-[#FF5A00] transition-all shadow-2xs"
                  title="Notifications & Updates from Followed Shops"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF5A00] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
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
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-bold text-[#006837] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
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
                      {role === 'merchant' && (
                        <Link
                          to="/merchant"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Store className="w-4 h-4 text-[#006837]" />
                          <span>My Restaurant Dashboard</span>
                        </Link>
                      )}

                      {/* Only Show Rider Portal If User is an actual Rider */}
                      {role === 'rider' && (
                        <Link
                          to="/rider"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Bike className="w-4 h-4 text-[#FF5A00]" />
                          <span>Rider Partner Console</span>
                        </Link>
                      )}

                      {/* Admin Console */}
                      {role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Platform Governance</span>
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Orders</span>
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
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50/50 text-xs font-bold text-slate-800 transition-all shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-[#FF5A00]" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#E65100] hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-2xs transition-all"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Cart Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2 bg-gradient-to-r from-[#FF5A00] to-[#E65100] hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] sm:text-xs font-bold leading-tight">
                    {totalItemCount > 0 ? `${totalItemCount} Items` : t('nav.cart')}
                  </span>
                  {totalItemCount > 0 && (
                    <span className="text-[10px] font-semibold text-orange-100 leading-none">
                      ₹{total}
                    </span>
                  )}
                </div>
                {totalItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#FF5A00] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FF5A00] shadow-sm animate-pulse">
                    {totalItemCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder') || 'Search Biryani, Groceries, Medicines...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 text-xs border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
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
    </>
  );
}
