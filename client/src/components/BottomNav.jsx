import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Home,
  Search,
  Sparkles,
  ShoppingBag,
  User,
  Store,
  Bike,
  ShieldCheck,
} from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();
  const { role, isLoggedIn } = useAuth();
  const { totalItemCount } = useCart();

  // If role is Merchant, show merchant bottom tabs
  if (role === 'merchant') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 md:hidden shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavLink
            to="/merchant"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Store</span>
          </NavLink>

          <NavLink
            to="/merchant#orders"
            className="flex flex-col items-center py-1.5 px-3 rounded-2xl text-slate-500 hover:text-slate-900 font-medium"
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Orders</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
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
            to="/rider"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <Bike className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Deliveries</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
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

  // Customer Bottom Navigation (Module 17: Home, Explore, Following, Orders, Profile)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 md:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
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
            `flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Explore</span>
        </NavLink>

        {/* 3. Following / Feed */}
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Following</span>
        </NavLink>

        {/* 4. Orders with Cart Count */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all relative ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">{t('nav.orders') || 'Orders'}</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
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
