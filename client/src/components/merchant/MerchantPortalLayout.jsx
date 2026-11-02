import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import api from '../../services/api';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CalendarDays,
  CircleDollarSign,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Bell,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink,
} from 'lucide-react';

export default function MerchantPortalLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    async function loadStoreInfo() {
      try {
        const res = await api.get('/merchants/my-store');
        if (res.data?.success) {
          setStoreData(res.data.store);
        }
        const ordersRes = await api.get('/merchants/orders');
        if (ordersRes.data?.success) {
          const pending = (ordersRes.data.orders || []).filter((o) => o.orderStatus === 'pending');
          setPendingOrdersCount(pending.length);
        }
      } catch (err) {
        // Ok if initial load
      }
    }
    loadStoreInfo();
  }, [location.pathname]);

  const handleToggleStoreOpen = async () => {
    if (!storeData) return;
    const nextState = !storeData.isOpen;
    try {
      const res = await api.put('/merchants/my-store', { isOpen: nextState });
      if (res.data.success) {
        setStoreData((prev) => ({ ...prev, isOpen: nextState }));
      }
    } catch (err) {
      console.error('Failed to toggle store open/close:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/merchant/orders', label: 'Active KOT & Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { to: '/merchant/menu', label: 'Menu Management', icon: UtensilsCrossed },
    { to: '/merchant/reservations', label: 'Table Reservations', icon: CalendarDays },
    { to: '/merchant/finance', label: 'Financial Settlements', icon: CircleDollarSign },
    { to: '/merchant/status', label: 'Compliance & Verification', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dedicated Dark/Clean Business Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-[#033B2D] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 border-r border-emerald-950/40 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Workspace Branding Header */}
          <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#064E3B] border border-emerald-600/30 flex items-center justify-center">
                  <Store className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-white tracking-tight">Merchant Workspace</h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">ManaMart Business</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-emerald-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store Quick Status Widget */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">
                {storeData?.name || user?.name || 'My Store'}
              </span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                {storeData?.category || 'Retail'}
              </span>
            </div>

            <button
              onClick={handleToggleStoreOpen}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm ${
                storeData?.isOpen
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600/90 hover:bg-red-600 text-white'
              }`}
            >
              {storeData?.isOpen ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>ONLINE • RECEIVING ORDERS</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>OFFLINE • STORE CLOSED</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF6B00] text-white shadow-md'
                      : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#FF6B00]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer Account & Logout */}
          <div className="p-4 border-t border-emerald-900/60 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'M'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono truncate">{user?.phone}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-emerald-950/80 hover:bg-red-950 hover:text-red-300 text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Console</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Management Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider hidden sm:inline">
              Store Console: {storeData?.name || 'Local Merchant'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Incoming Order Alert Pill */}
            <NavLink
              to="/merchant/orders"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF6B00] border border-orange-200 text-xs font-bold hover:bg-orange-100 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingOrdersCount} New Orders</span>
            </NavLink>

            <span className="text-xs text-slate-400">|</span>

            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Settlements Active
            </span>
          </div>
        </header>

        {/* Child Views */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

