import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../Logo';
import {
  LayoutDashboard,
  Navigation,
  Wallet,
  Flame,
  History,
  BatteryCharging,
  ShieldCheck,
  Headset,
  Power,
  LogOut,
  MapPin,
  AlertTriangle,
  Menu,
  X,
  Phone,
  Zap,
  CheckCircle2,
  QrCode,
  Radio,
  ExternalLink,
  Coins,
} from 'lucide-react';

const defaultRiderContext = {
  isOnline: true,
  setIsOnline: () => {},
  handleToggleOnline: () => {},
  activeTrip: {
    id: 'MM-8942',
    orderNumber: '8942',
    title: 'Kirana Grocery Basket',
    customerName: 'S. Raman',
    customerPhone: '+919876543210',
    itemCount: 4,
    paymentMethod: 'UPI',
    etaMinutes: 11,
    slaTag: 'Express 15m SLA',
    pickup: {
      name: 'Sri Swagath Grand Kirana',
      address: 'Madhapur Main Road',
      lat: 17.4480,
      lng: 78.3910,
    },
    drop: {
      name: 'Sai Residency, Flat 402',
      address: 'Madhapur, Hitec Hub',
      lat: 17.4520,
      lng: 78.3880,
    },
  },
  setActiveTrip: () => {},
  riderProfile: {
    name: 'Suresh Varma',
    rating: 4.9,
    heroId: 'MM-84920',
    hub: 'Madhapur Hub Cluster',
    vehicleTag: 'EV-04',
    todayEarnings: 840,
    cashInHand: 620,
    completedTrips: 6,
    totalRatings: 142,
    batteryPercent: 86,
    batteryKm: 68,
  },
  setRiderProfile: () => {},
  openSosModal: () => {},
  openRemitModal: () => {},
  openSupportModal: () => {},
  openBatteryModal: () => {},
  openSurgeModal: () => {},
};

const RiderPortalContext = createContext(defaultRiderContext);

export function useRiderPortal() {
  const ctx = useContext(RiderPortalContext);
  return ctx || defaultRiderContext;
}

export default function RiderPortalLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTrip, setActiveTrip] = useState(defaultRiderContext.activeTrip);

  const [riderProfile, setRiderProfile] = useState({
    name: user?.name || 'Suresh Varma',
    rating: 4.9,
    heroId: 'MM-84920',
    hub: 'Madhapur Hub Cluster',
    vehicleTag: 'EV-04',
    todayEarnings: 840,
    cashInHand: 620,
    completedTrips: 6,
    totalRatings: 142,
    batteryPercent: 86,
    batteryKm: 68,
  });

  // Modals state
  const [showSosModal, setShowSosModal] = useState(false);
  const [showRemitModal, setShowRemitModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [showSurgeModal, setShowSurgeModal] = useState(false);

  useEffect(() => {
    let batteryObj = null;
    let onLevelChange = null;

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        batteryObj = battery;
        const pct = Math.round(battery.level * 100);
        setRiderProfile((prev) => ({
          ...prev,
          batteryPercent: pct,
          batteryKm: Math.round(pct * 0.8),
        }));
        onLevelChange = () => {
          const newPct = Math.round(battery.level * 100);
          setRiderProfile((prev) => ({
            ...prev,
            batteryPercent: newPct,
            batteryKm: Math.round(newPct * 0.8),
          }));
        };
        battery.addEventListener('levelchange', onLevelChange);
      }).catch(() => {});
    }

    return () => {
      if (batteryObj && onLevelChange) {
        batteryObj.removeEventListener('levelchange', onLevelChange);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadRiderInfo() {
      try {
        const res = await api.get('/riders/profile');
        if (isMounted && res.data?.success) {
          if (res.data.rider) {
            setIsOnline(Boolean(res.data.rider.isOnline));
            setRiderProfile((prev) => ({
              ...prev,
              name: res.data.rider.name || prev.name,
              rating: res.data.rider.rating || prev.rating,
              todayEarnings: res.data.rider.todayEarnings || prev.todayEarnings,
              cashInHand: res.data.rider.cashInHand !== undefined ? res.data.rider.cashInHand : prev.cashInHand,
              completedTrips: res.data.rider.todayDeliveries || prev.completedTrips,
            }));
          }
          if (res.data.activeOrder) {
            setActiveTrip((prev) => ({
              ...prev,
              id: res.data.activeOrder.orderNumber || res.data.activeOrder.id || prev.id,
              orderNumber: res.data.activeOrder.orderNumber?.slice(-4) || prev.orderNumber,
              customerName: res.data.activeOrder.customerName || prev.customerName,
              customerPhone: res.data.activeOrder.customerPhone || prev.customerPhone,
            }));
          }
        }
      } catch (err) {
        // Fallback to rich prototype data
      }
    }
    loadRiderInfo();
    return () => { isMounted = false; };
  }, []);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await api.put('/riders/status');
    } catch (err) {
      // Offline/demo fallback maintains seamless interactive toggle
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const contextValue = useMemo(() => ({
    isOnline,
    setIsOnline,
    handleToggleOnline,
    activeTrip,
    setActiveTrip,
    riderProfile,
    setRiderProfile,
    openSosModal: () => setShowSosModal(true),
    openRemitModal: () => setShowRemitModal(true),
    openSupportModal: () => setShowSupportModal(true),
    openBatteryModal: () => setShowBatteryModal(true),
    openSurgeModal: () => setShowSurgeModal(true),
  }), [isOnline, activeTrip, riderProfile]);

  return (
    <RiderPortalContext.Provider value={contextValue}>
      <div className="bg-[#f4f7f6] dark:bg-[#121c2a] text-slate-800 dark:text-slate-100 antialiased font-sans min-h-screen flex flex-col xl:flex-row overflow-x-hidden selection:bg-emerald-200">
        
        {/* Mobile Navigation Drawer Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ============================================================== */}
        {/* LEFT SIDEBAR (ManaMart Delivery Hero Command Console)          */}
        {/* ============================================================== */}
        <aside
          className={`fixed xl:static top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#1a2332] text-slate-800 dark:text-slate-100 flex-shrink-0 flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 shadow-lg xl:shadow-sm transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
          }`}
        >
          <div className="p-6 flex flex-col">
            {/* Logo & Close Button (Mobile) */}
            <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Logo showTagline={true} />
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="xl:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duty Status Badge & Toggle */}
            <div
              onClick={handleToggleOnline}
              className={`border rounded-2xl p-4 mb-6 flex items-center justify-between cursor-pointer transition-all ${
                isOnline
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700 hover:border-emerald-300'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <span
                    className={`w-2.5 h-2.5 rounded-full inline-block ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                  {isOnline && (
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block absolute top-0 left-0 live-radar-ping" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Duty Mode
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {isOnline ? 'Online • Active' : 'Offline • Duty Paused'}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isOnline
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isOnline ? riderProfile.vehicleTag : `${riderProfile.vehicleTag} Standby`}
              </span>
            </div>

            {/* Operations Label */}
            <div className="px-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Operations
              </span>
            </div>

            {/* Navigation Links */}
            <nav aria-label="Sidebar Navigation" className="space-y-1">
              <NavLink
                to="/rider/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-sm">Console & Tasks</span>
                </div>
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                  {isOnline ? '3 Live' : 'Paused'}
                </span>
              </NavLink>

              <NavLink
                to="/rider/active-trip"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Navigation className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                  <span className="text-sm">Active Trip</span>
                </div>
                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                  #{activeTrip?.orderNumber || '8942'}
                </span>
              </NavLink>

              <NavLink
                to="/rider/earnings"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                  <span className="text-sm">Earnings & Payout</span>
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  ₹{riderProfile.todayEarnings}
                </span>
              </NavLink>

              <button
                type="button"
                onClick={() => setShowSurgeModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition group text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Flame className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                  <span className="text-sm font-medium">Surge Radar</span>
                </div>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  +₹20
                </span>
              </button>

              <NavLink
                to="/rider/history"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`
                }
              >
                <History className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                <span className="text-sm">Trip History</span>
              </NavLink>

              <button
                type="button"
                onClick={() => setShowBatteryModal(true)}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition group text-left cursor-pointer"
              >
                <BatteryCharging className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                <span className="text-sm font-medium">Battery Swap Stations</span>
              </button>

              <NavLink
                to="/rider/status"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                <span className="text-sm">Safety & Documents</span>
              </NavLink>
            </nav>
          </div>

          {/* Bottom Rider Profile Deck */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#151c28]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#055c24] flex items-center justify-center font-bold text-white text-base shadow-sm ring-2 ring-emerald-100 dark:ring-emerald-900">
                {riderProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  {riderProfile.name}
                  <span className="text-amber-500 text-xs font-semibold">★ {riderProfile.rating}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  Hero ID: {riderProfile.heroId}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {riderProfile.hub}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Headset className="w-3.5 h-3.5 text-slate-500" />
                <span>Support</span>
              </button>

              {isOnline ? (
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Offline</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className="py-2 px-3 rounded-xl bg-[#055c24] hover:bg-[#033f18] text-white font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5 text-white" />
                  <span>Go Online</span>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* MAIN CONTENT AREA                                              */}
        {/* ============================================================== */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Floating Header Bar */}
          <header className="bg-white dark:bg-[#1a2332] sticky top-0 z-20 border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-8 py-4 sm:py-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
              
              {/* Title, Mobile Toggle & Location */}
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer mt-0.5"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div>
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Delivery Hero Command Console
                    </h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Fleet Node 2.4
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1 flex items-center gap-2 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Active Zone:{' '}
                      <strong className="text-slate-700 dark:text-slate-200 font-medium">
                        Madhapur & Hitec City Cluster
                      </strong>
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    {isOnline ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Real-time dispatch synced
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        Dispatch Paused • Standby
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Telemetry Indicators & Quick SOS */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-end md:self-auto">
                
                {/* GPS Indicator */}
                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{isOnline ? 'GPS Active (1.2m)' : 'GPS Standby / Power Save'}</span>
                </div>

                {/* Battery Indicator */}
                <button
                  type="button"
                  onClick={() => setShowBatteryModal(true)}
                  className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:border-slate-300"
                >
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {riderProfile.batteryPercent}%{' '}
                    <span className="text-slate-400 dark:text-slate-500">
                      ({riderProfile.batteryKm} km)
                    </span>
                  </span>
                </button>

                {/* COD Ledger */}
                <button
                  type="button"
                  onClick={() => setShowRemitModal(true)}
                  className="flex items-center space-x-2 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-amber-100/70"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>COD: ₹{riderProfile.cashInHand}</span>
                </button>

                {/* SOS Emergency Trigger */}
                <button
                  type="button"
                  onClick={() => setShowSosModal(true)}
                  className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>SOS</span>
                </button>
              </div>
            </div>
          </header>

          {/* Child Page Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Console Footer */}
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2332] px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Connected to ManaMart Fleet Dispatch Engine (Hyderabad-West Node #12)</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => alert('ManaMart Rider Safety Manual: Always wear helmet, adhere to 40 km/h speed in colonies, verify OTP before handoff.')}
                className="hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                Rider Safety Manual
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => alert('Base Payout: ₹40 for first 2 km + ₹10/km after. Surge bonus +₹20 in 100ft road zone.')}
                className="hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                Payout Ratecard
              </button>
              <span>•</span>
              <span className="text-slate-400">© 2026 ManaMart Technologies</span>
            </div>
          </footer>
        </main>

        {/* ============================================================== */}
        {/* INTERACTIVE MODALS (SOS, REMIT QR, BATTERY SWAP, SUPPORT)     */}
        {/* ============================================================== */}

        {/* SOS Emergency Modal */}
        {showSosModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1c2738] rounded-3xl max-w-md w-full p-6 space-y-5 border border-rose-200 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Emergency Dispatch Assistance</h3>
                  <p className="text-xs text-slate-500">Live GPS beacon broadcasting to Hyderabad Fleet Ops</p>
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                <p className="font-bold">Your Live Coordinates: 17.4480° N, 78.3910° E</p>
                <p>Location: Kavuri Hills / Madhapur 100ft Road intersection.</p>
              </div>

              <div className="space-y-2.5">
                <a
                  href="tel:112"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Emergency Police (112 / 100)</span>
                </a>
                <a
                  href="tel:+914048920012"
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Headset className="w-4 h-4 text-emerald-400" />
                  <span>Call Fleet Safety Coordinator (+91 40 4892 0012)</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    alert('Accident / Breakdown assistance ticket #EM-9912 dispatched. Team contacting you in 60 seconds.');
                    setShowSosModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
                >
                  Request On-Road Vehicle Towing / Flat Tyre
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel / False Alarm
              </button>
            </div>
          </div>
        )}

        {/* Remittance Hub QR Modal */}
        {showRemitModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1c2738] rounded-3xl max-w-sm w-full p-6 space-y-5 border border-slate-200/80 shadow-2xl text-center">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Remittance Handover QR</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRemitModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-300">
                <span className="block font-semibold">Deposit Amount Due</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{riderProfile.cashInHand}.00</span>
              </div>

              {/* Simulated QR Code Visual */}
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                <div className="w-48 h-48 bg-slate-900 rounded-xl p-2 flex flex-col justify-between text-white text-[9px] font-mono">
                  <div className="flex justify-between">
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-slate-900 font-bold text-xs">■</div>
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-slate-900 font-bold text-xs">■</div>
                  </div>
                  <div className="text-center py-2 text-emerald-400 font-bold text-[11px]">
                    SCAN AT HUB #04
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-slate-900 font-bold text-xs">■</div>
                    <span className="text-[10px] text-slate-400">MM-REMIT-620</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Present this QR code to the cashier at <strong>Kavuri Hills Hub #04</strong> (600m away) to remit collected COD.
              </p>

              <button
                type="button"
                onClick={() => {
                  setRiderProfile((prev) => ({ ...prev, cashInHand: 0 }));
                  alert('Remittance confirmed! ₹620 handed over. Receipt #RC-8819 issued to your ledger.');
                  setShowRemitModal(false);
                }}
                className="w-full py-3 bg-[#055c24] hover:bg-[#033f18] text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                Simulate Cash Deposit (Set COD to ₹0)
              </button>
            </div>
          </div>
        )}

        {/* Battery Hub Stations Modal */}
        {showBatteryModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1c2738] rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200/80 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BatteryCharging className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">EV Battery Swap Stations</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatteryModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Current charge: <strong>{riderProfile.batteryPercent}% ({riderProfile.batteryKm} km range)</strong>. 3 rapid swap stations nearby:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Ather Grid / Sun Mobility Hub</h4>
                    <p className="text-slate-500">Beside D-Mart, Kavuri Hills • 450m away</p>
                    <span className="text-emerald-700 font-semibold">6 Charged Packs Available</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.open('https://www.google.com/maps/search/Ather+Grid+Kavuri+Hills', '_blank');
                    }}
                    className="px-3 py-1.5 bg-[#055c24] text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Hero Surge Station #12</h4>
                    <p className="text-slate-500">Metro Pillar 104, Hitec City • 1.1 km</p>
                    <span className="text-emerald-700 font-semibold">4 Charged Packs Available</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.open('https://www.google.com/maps/search/EV+charging+station+Hitec+City', '_blank');
                    }}
                    className="px-3 py-1.5 bg-[#055c24] text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBatteryModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close Station Finder
              </button>
            </div>
          </div>
        )}

        {/* Support Hotline Dialog */}
        {showSupportModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1c2738] rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200/80 shadow-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Headset className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">ManaMart Fleet Support Desk</h3>
              <p className="text-xs text-slate-500">
                Direct phone helpline for trip reassignments, customer address mismatch, and payment issues.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Toll-Free: 1800-419-MANA (6262)
              </div>
              <div className="space-y-2">
                <a
                  href="tel:18004196262"
                  className="w-full py-3 bg-[#055c24] hover:bg-[#033f18] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Fleet Support (24x7)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Surge Hotspots Dialog */}
        {showSurgeModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1c2738] rounded-3xl max-w-sm w-full p-6 space-y-4 border border-amber-200 shadow-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Active Surge Zones (+₹20 / order)</h3>
              <p className="text-xs text-slate-500">
                High evening delivery volume is active in <strong>Madhapur 100ft Road</strong> & <strong>Ayyappa Society</strong>.
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-xs text-amber-900 dark:text-amber-300 font-semibold">
                Earn an extra ₹20 per trip on all orders accepted in this zone until 10:30 PM.
              </div>
              <button
                type="button"
                onClick={() => setShowSurgeModal(false)}
                className="w-full py-2.5 bg-[#055c24] hover:bg-[#033f18] text-white rounded-xl font-bold text-xs"
              >
                Understood, Show Dispatches
              </button>
            </div>
          </div>
        )}

      </div>
    </RiderPortalContext.Provider>
  );
}
