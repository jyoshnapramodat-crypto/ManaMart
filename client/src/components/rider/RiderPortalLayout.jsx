import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Bike,
  Navigation,
  DollarSign,
  History,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Menu,
  X,
  Phone,
  Radio,
} from 'lucide-react';

export default function RiderPortalLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    async function loadRiderInfo() {
      try {
        const res = await api.get('/riders/profile');
        if (res.data?.success) {
          setIsOnline(Boolean(res.data.rider?.isOnline));
          if (res.data.activeOrder) {
            setActiveTrip(res.data.activeOrder);
          }
        }
      } catch (err) {
        // Ok if initial load
      }
    }
    loadRiderInfo();
  }, [location.pathname]);

  const handleToggleOnline = async () => {
    try {
      const res = await api.put('/riders/status');
      if (res.data?.success) {
        setIsOnline(res.data.isOnline);
      }
    } catch (err) {
      console.error('Failed to toggle rider duty status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/rider/dashboard', label: 'Dashboard & Nearby Tasks', icon: Radio },
    { to: '/rider/active-trip', label: 'Active Delivery Trip', icon: Navigation, badge: activeTrip ? '1 Active' : null },
    { to: '/rider/earnings', label: 'Earnings & Payouts', icon: DollarSign },
    { to: '/rider/history', label: 'Delivery History', icon: History },
    { to: '/rider/status', label: 'License & Compliance', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8ED] flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile-First Header with Online/Offline Switch */}
      <header className="sticky top-0 z-30 bg-[#064E3B] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-emerald-900/60 text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
              <Bike className="w-4 h-4" />
            </div>
            <span className="font-black text-sm tracking-tight">Delivery Hero Console</span>
          </div>
        </div>

        {/* Online/Offline Toggle */}
        <button
          onClick={handleToggleOnline}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white animate-pulse'
              : 'bg-red-500 hover:bg-red-400 text-white'
          }`}
        >
          {isOnline ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          <span>{isOnline ? 'DUTY ONLINE' : 'OFFLINE'}</span>
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[53px] z-50 lg:z-10 h-screen lg:h-[calc(100vh-53px)] w-64 bg-[#033B2D] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 border-r border-emerald-900 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-3">
          <nav className="space-y-1 pt-2">
            <div className="px-3 pb-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              Rider Fleet Navigation
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF6B00] text-white shadow-md'
                      : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-bounce">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Account and Sign Out */}
          <div className="p-3 border-t border-emerald-900 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'R'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono truncate">{user?.phone}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-emerald-950 hover:bg-red-900 text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Rider Content View */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}

