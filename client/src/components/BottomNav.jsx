import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Home, Sparkles, Repeat, ShoppingBag, Store, Bike, ShieldCheck, User } from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();
  const { role } = useAuth();

  const getDashboardLink = () => {
    switch (role) {
      case 'merchant':
        return { path: '/merchant', label: 'Store', icon: Store };
      case 'rider':
        return { path: '/rider', label: 'Rider', icon: Bike };
      case 'admin':
        return { path: '/admin', label: 'Admin', icon: ShieldCheck };
      default:
        return { path: '/orders', label: t('nav.orders'), icon: ShoppingBag };
    }
  };

  const dashboard = getDashboardLink();
  const DashboardIcon = dashboard.icon;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 md:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.home')}</span>
        </NavLink>

        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.feed')}</span>
        </NavLink>

        <NavLink
          to="/recurring"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <Repeat className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.recurring')}</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
              isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav.orders')}</span>
        </NavLink>

        {role !== 'customer' && (
          <NavLink
            to={dashboard.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <DashboardIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{dashboard.label}</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
