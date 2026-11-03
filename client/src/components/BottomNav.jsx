import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Home,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  ShoppingCart,
  User,
  Store,
  Bike,
  ShieldCheck,
} from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();
  const { role, isLoggedIn } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();

  // If role is Merchant, show merchant bottom tabs
  if (role === 'merchant') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 md:hidden shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavLink
            to="/merchant"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-[#FF6B00] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Store</span>
          </NavLink>

          <NavLink
            to="/merchant/orders"
            className="flex flex-col items-center py-1.5 px-3 rounded-2xl text-slate-500 hover:text-slate-900 font-medium"
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">KOT Orders</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-[#FF6B00] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Account</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  // If role is Rider, show rider bottom tabs
  if (role === 'rider') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 md:hidden shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavLink
            to="/rider/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-[#FF6B00] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <Bike className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Tasks</span>
          </NavLink>

          <NavLink
            to="/rider/active-trip"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-[#FF6B00] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <Bike className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Active Trip</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-[#FF6B00] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Profile</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  // Customer Mobile Bottom Navigation: [Home, Explore, Dine-In, Orders, Cart]
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1 md:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
              isActive ? 'text-[#064E3B] font-black' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.home') || 'Home'}</span>
        </NavLink>

        {/* 2. Explore / Search */}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
              isActive ? 'text-[#064E3B] font-black' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Explore</span>
        </NavLink>

        {/* 3. Dine-In Table Bookings */}
        <NavLink
          to="/reservations"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
              isActive ? 'text-[#FF6B00] font-black' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dine-In</span>
        </NavLink>

        {/* 4. Orders */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-2xl transition-all relative ${
              isActive ? 'text-[#064E3B] font-black' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.orders') || 'Orders'}</span>
        </NavLink>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-2xl text-slate-500 hover:text-slate-900 font-semibold transition-all relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5 text-[#FF6B00]" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF6B00] text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {totalItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>
      </div>
    </nav>
  );
}

