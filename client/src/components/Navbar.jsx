import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentCity, selectedLocality, setIsModalOpen } = useLocation();
  const { totalItemCount, total, setIsCartOpen } = useCart();
  const { user, isLoggedIn, logout, role } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Location Pill */}
          <div className="flex items-center space-x-3 sm:space-x-5 flex-shrink-0">
            <Logo size="md" showTagline={true} to="/" />

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 transition-all text-left"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-orange-600" />
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
                placeholder={t('nav.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm border border-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Right Action Icons & Utilities */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Quick Links on Large Screens */}
            <div className="hidden lg:flex items-center space-x-3 text-xs font-semibold text-slate-600">
              <Link to="/feed" className="flex items-center space-x-1 hover:text-orange-600 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('nav.feed')}</span>
              </Link>
              <Link to="/recurring" className="flex items-center space-x-1 hover:text-orange-600 transition-colors">
                <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('nav.recurring')}</span>
              </Link>
              <Link to="/parcel" className="flex items-center space-x-1 hover:text-orange-600 transition-colors">
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
              <Globe className="w-3.5 h-3.5 text-orange-500" />
              <span>{i18n.language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* User Account / Sign In Dropdown */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50/50 text-xs font-bold text-slate-800 transition-all shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[70px] sm:max-w-[100px] truncate">
                    {user?.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs font-medium space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{user?.role} Mode</p>
                    </div>

                    <Link
                      to="/app"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-orange-600" />
                      <span>Marketplace Store</span>
                    </Link>

                    {role === 'merchant' && (
                      <Link
                        to="/merchant"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>Merchant Dashboard</span>
                      </Link>
                    )}

                    {role === 'rider' && (
                      <Link
                        to="/rider"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Bike className="w-4 h-4 text-orange-600" />
                        <span>Rider Console</span>
                      </Link>
                    )}

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
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-2xs transition-all"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all"
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
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-600 shadow-sm animate-pulse">
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
              placeholder={t('nav.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 text-xs border border-transparent focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>
    </header>
  );
}

