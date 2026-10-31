import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentCity, selectedLocality, setIsModalOpen } = useLocation();
  const { totalItemCount, total, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('manamart_lang', nextLang);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Location Pill */}
          <div className="flex items-center space-x-3 sm:space-x-5 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">ManaMart</span>
                  <span className="text-[10px] uppercase font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md hidden md:inline">
                    LocalLoop
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block tracking-wide">
                  {i18n.language === 'te' ? 'మన ఊరు. మన మార్కెట్.' : 'Mana Ooru. Mana Market.'}
                </span>
              </div>
            </Link>

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

            {/* User Account / Sign In Button */}
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50/50 text-xs font-bold text-slate-800 transition-all shadow-2xs"
              title="Account Login / Register"
            >
              <User className="w-3.5 h-3.5 text-orange-600" />
              <span className="max-w-[80px] sm:max-w-[110px] truncate">
                {user ? user.name.split(' ')[0] : 'Sign In'}
              </span>
            </Link>

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

