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
  Battery,
  Wallet,
  MapPin,
} from 'lucide-react';

export default function RiderPortalLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);
  const [cashInHand, setCashInHand] = useState(850);
  const [batteryLevel, setBatteryLevel] = useState(94);

  useEffect(() => {
    // Read device battery if available in browser
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }

    async function loadRiderInfo() {
      try {
        const res = await api.get('/riders/profile');
        if (res.data?.success) {
          setIsOnline(Boolean(res.data.rider?.isOnline));
          if (res.data.activeOrder) {
            setActiveTrip(res.data.activeOrder);
          }
          if (res.data.cashInHand !== undefined) {
            setCashInHand(res.data.cashInHand);
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

      {/* Mobile-First Header with Rider Avatar, Name, and Prominent Online/Offline Switch */}
      <header className="sticky top-0 z-30 bg-[#064E3B] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-emerald-900/60 text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Rider Avatar & Name */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-black text-xs shadow-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'R'}
            </div>
            <div className="hidden xs:block sm:block">
              <span className="font-black text-xs text-white block leading-tight truncate max-w-[110px] sm:max-w-[160px]">
                {user?.name || 'Rider Hero'}
              </span>
              <span className="text-[9px] text-emerald-300 font-semibold uppercase tracking-wider block">
                ManaMart Fleet
              </span>
            </div>
          </div>
        </div>

        {/* Prominent Online/Offline Toggle */}
        <button
          onClick={handleToggleOnline}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
              : 'bg-red-500 hover:bg-red-400 text-white'
          }`}
        >
          {isOnline ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          <span>{isOnline ? 'Online' : 'Go Offline'}</span>
        </button>
      </header>

      {/* Rider Telemetry & Quick-Access Cash-in-Hand Ledger Sub-Bar */}
      <div className="bg-[#033B2D] text-white px-3 sm:px-4 py-1.5 flex items-center justify-between text-[11px] border-b border-emerald-900/60 font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPS Active</span>
          </span>
          <span className="text-emerald-700">|</span>
          <span className="flex items-center space-x-1 text-slate-300">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>{batteryLevel}% Battery</span>
          </span>
        </div>

        <NavLink
          to="/rider/earnings"
          className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-900/80 hover:bg-[#FF6B00] text-emerald-200 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
          title="Quick-access Cash-in-Hand ledger"
        >
          <Wallet className="w-3 h-3 text-[#FF6B00]" />
          <span>COD Cash: ₹{cashInHand}</span>
        </NavLink>
      </div>

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

