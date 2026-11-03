import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import RiderPortalLayout, { useRiderPortal } from '../../components/rider/RiderPortalLayout';
import api from '../../services/api';
import {
  Navigation,
  Navigation2,
  Phone,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Coins,
  Wallet,
  CheckCircle2,
  Star,
  Radar,
  Zap,
  Calendar,
  Sparkles,
  ShoppingBag,
  Utensils,
  Pill,
  Check,
  Target,
  Map,
  Building2,
  QrCode,
  Moon,
  BatteryCharging,
  ShieldCheck,
  Power,
  Flame,
  ChevronRight,
} from 'lucide-react';

export default function RiderDashboardView() {
  const navigate = useNavigate();
  const {
    isOnline,
    handleToggleOnline,
    activeTrip,
    setActiveTrip,
    riderProfile,
    setRiderProfile,
    openRemitModal,
  } = useRiderPortal();

  // Tasks filter pill: 'immediate' | 'prebooked' | 'surge'
  const [activeTab, setActiveTab] = useState('immediate');
  const [tasks, setTasks] = useState([
    {
      taskId: 'task-8943',
      orderNumber: '8943',
      merchantName: 'Sri Lakshmi Kirana & General Store',
      categoryTag: 'Grocery • 3.2 kg',
      slaBadge: '18 min SLA',
      pickupAddress: '1.2 km (Near Pillar 104)',
      dropoffAddress: 'Jubilee Hills Rd 36 (3.4 km)',
      earnings: 72,
      type: 'immediate',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
    {
      taskId: 'task-8944',
      orderNumber: '8944',
      merchantName: 'Subbayya Gari Hotel',
      categoryTag: 'Hot Food Pack',
      slaBadge: 'Ready Now',
      pickupAddress: '800m (Madhapur Main Rd)',
      dropoffAddress: 'Kavuri Hills, Block B (1.8 km)',
      earnings: 58,
      type: 'immediate',
      icon: Utensils,
      iconBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300',
    },
    {
      taskId: 'task-8945',
      orderNumber: '8945',
      merchantName: 'Apollo Pharmacy 24/7',
      categoryTag: 'Medicines',
      slaBadge: '+₹15 Peak Surge',
      pickupAddress: '1.5 km (Near Pillar 28)',
      dropoffAddress: 'Ayyappa Society (2.1 km)',
      earnings: 85,
      type: 'surge',
      icon: Pill,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300',
    },
  ]);

  // Load backend tasks if connected
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await api.get('/riders/tasks/nearby');
        if (res.data?.success && res.data.tasks?.length > 0) {
          // Enrich backend tasks with icon mapping
          const mapped = res.data.tasks.map((t, idx) => ({
            taskId: t.taskId || `task-${idx}`,
            orderNumber: t.orderNumber || `${8950 + idx}`,
            merchantName: t.merchantName || 'Neighborhood Store',
            categoryTag: t.categoryTag || 'Hyperlocal Order',
            slaBadge: t.slaBadge || '15 min SLA',
            pickupAddress: t.pickupAddress || 'Madhapur Main Road',
            dropoffAddress: t.dropoffAddress || 'Hitec City, Hyderabad',
            earnings: t.earnings || 65,
            type: idx % 2 === 0 ? 'immediate' : 'surge',
            icon: idx % 2 === 0 ? ShoppingBag : Utensils,
            iconBg: idx % 2 === 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300',
          }));
          setTasks(mapped);
        }
      } catch (err) {
        // Fallback uses the rich prototype tasks array
      }
    }
    fetchTasks();
  }, []);

  const handleAcceptTask = async (task) => {
    try {
      await api.post(`/riders/tasks/${task.taskId}/accept`);
    } catch (err) {
      // Ok fallback
    }

    // Set as active delivery trip
    setActiveTrip({
      id: `MM-${task.orderNumber}`,
      orderNumber: task.orderNumber,
      title: `${task.merchantName} Delivery`,
      customerName: 'S. Raman',
      customerPhone: '+919876543210',
      itemCount: 3,
      paymentMethod: 'UPI',
      etaMinutes: 14,
      slaTag: task.slaBadge,
      pickup: {
        name: task.merchantName,
        address: task.pickupAddress,
        lat: 17.4480,
        lng: 78.3910,
      },
      drop: {
        name: 'Sai Residency, Flat 402',
        address: task.dropoffAddress,
        lat: 17.4520,
        lng: 78.3880,
      },
    });

    // Remove from available tasks
    setTasks((prev) => prev.filter((t) => t.taskId !== task.taskId));
    navigate('/rider/active-trip');
  };

  const handleIgnoreTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'immediate') return true;
    if (activeTab === 'prebooked') return t.type === 'prebooked';
    if (activeTab === 'surge') return t.type === 'surge' || t.slaBadge.includes('Surge');
    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* ============================================================== */}
      {/* 1. TOP BANNER: ACTIVE TRIP (ONLINE) OR IDLE SHIFT CARD (OFFLINE)*/}
      {/* ============================================================== */}
      {isOnline ? (
        /* Active Delivery Trip Card (Trip #MM-8942) */
        <section
          className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden"
          data-purpose="active-delivery-trip-card"
        >
          {/* Top header row with status badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Delivery
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                Trip ID #{activeTrip?.id || 'MM-8942'}
              </span>
              <span className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/70 dark:border-amber-900/50">
                {activeTrip?.slaTag || 'Express 15m SLA'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Est. drop in{' '}
                <strong className="text-slate-900 dark:text-white font-bold text-sm">
                  {activeTrip?.etaMinutes || 11} mins
                </strong>
              </span>
            </div>
          </div>

          {/* Route layout and Action CTAs */}
          <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left 8 cols: Order info & 2 Route Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Order #{activeTrip?.orderNumber || '8942'} • {activeTrip?.title || 'Kirana Grocery Basket'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                  Customer: {activeTrip?.customerName || 'S. Raman'} • {activeTrip?.itemCount || 4} items • Paid via {activeTrip?.paymentMethod || 'UPI'}
                </p>
              </div>

              {/* Route Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* Pickup Point */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Picked Up
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block truncate">
                      {activeTrip?.pickup?.name || 'Sri Swagath Grand Kirana'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {activeTrip?.pickup?.address || 'Madhapur Main Road'}
                    </span>
                  </div>
                </div>

                {/* Drop Point */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-200/70 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-semibold block">
                      Delivering To
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block truncate">
                      {activeTrip?.drop?.name || 'Sai Residency, Flat 402'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {activeTrip?.drop?.address || 'Madhapur, Hitec Hub'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Action CTAs */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <NavLink
                to="/rider/active-trip"
                className="w-full px-5 py-3.5 bg-[#055c24] hover:bg-[#033f18] text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Navigation2 className="w-4 h-4" />
                <span>Navigate & Enter OTP</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </NavLink>

              <a
                href={`tel:${activeTrip?.customerPhone || '+919876543210'}`}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Call Customer</span>
              </a>
            </div>
          </div>
        </section>
      ) : (
        /* Idle / Offline Shift Card (Shift Paused) */
        <section
          className="bg-white dark:bg-[#1a2332] rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden"
          data-purpose="idle-shift-state-card"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                <Moon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Shift Paused
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Madhapur & Hitec City Hub
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  You are currently Offline
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
                  Turn on duty mode to start receiving real-time hyperlocal dispatch orders across Madhapur, Hitec City, and Jubilee Hills clusters.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Vehicle Battery 86% ✓
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Thermal Bag Inspected ✓
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Cash-in-hand within limits ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={handleToggleOnline}
                className="w-full md:w-auto px-6 py-3.5 bg-[#055c24] hover:bg-[#033f18] text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>Go Online & Start Receiving Orders</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 2. PERFORMANCE VITALS DECK (4 Responsive Stat Cards)           */}
      {/* ============================================================== */}
      <section aria-label="Daily Metrics Summary" data-purpose="performance-vitalks-deck">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Today's Earnings */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Earnings
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <span className="font-bold text-sm">₹</span>
              </div>
            </div>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{riderProfile.todayEarnings}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18%
              </span>
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Direct UPI instant pay</span>
              <NavLink
                to="/rider/earnings"
                className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
              >
                Ledger →
              </NavLink>
            </div>
          </div>

          {/* Card 2: COD Cash-in-Hand */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                COD Cash-in-Hand
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{riderProfile.cashInHand}
              </span>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                Safe limit
              </span>
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Due by 10:00 PM</span>
              <button
                type="button"
                onClick={openRemitModal}
                className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 cursor-pointer"
              >
                Remit →
              </button>
            </div>
          </div>

          {/* Card 3: Completed Trips */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed Trips
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {riderProfile.completedTrips}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Orders fulfilled</span>
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">100% On-time SLA</span>
              <span className="text-slate-400">0 cancelled</span>
            </div>
          </div>

          {/* Card 4: Partner Rating */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Partner Rating
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {riderProfile.rating}
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                Top Tier
              </span>
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{riderProfile.totalRatings} ratings total</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">+₹150 Bonus</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. DUAL-COLUMN OPERATIONS GRID (8 COLS DISPATCH + 4 COLS SIDE)  */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" data-purpose="operations-and-feed-grid">
        
        {/* ============================================================ */}
        {/* LEFT 8 COLS: Available Orders / Dispatch Queue               */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {isOnline ? (
            /* Online Dispatch Feed */
            <>
              {/* Queue Header & Filter Tabs */}
              <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <Radar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        Available Delivery Tasks
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Orders matched within 2.5 km of your live location
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {filteredTasks.length} Deliveries Ready
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-2 pt-4 overflow-x-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('immediate')}
                    className={`px-4 py-2 rounded-xl transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                      activeTab === 'immediate'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Immediate Pickups ({tasks.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('prebooked')}
                    className={`px-4 py-2 rounded-xl transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                      activeTab === 'prebooked'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pre-Booked Batches (2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('surge')}
                    className={`px-4 py-2 rounded-xl transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                      activeTab === 'surge'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Surge Hotspots (+₹20)</span>
                  </button>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3.5">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#1a2332] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    No active dispatches matching this filter. Switch tabs to view available tasks.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const IconComp = task.icon || ShoppingBag;
                    return (
                      <div
                        key={task.taskId}
                        className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                          
                          {/* Left: Store, tags, route */}
                          <div className="flex items-start space-x-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${task.iconBg}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                  {task.merchantName}
                                </h4>
                                <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                  {task.categoryTag}
                                </span>
                                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded">
                                  {task.slaBadge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                                <span>
                                  Pickup: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{task.pickupAddress}</strong>
                                </span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span>
                                  Drop: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{task.dropoffAddress}</strong>
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Earnings & Accept/Ignore */}
                          <div className="flex items-center justify-between md:justify-end space-x-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                            <div className="text-left md:text-right">
                              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                                Earnings
                              </span>
                              <span className="text-2xl font-black text-slate-900 dark:text-white">
                                ₹{task.earnings}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2.5">
                              <button
                                type="button"
                                onClick={() => handleIgnoreTask(task.taskId)}
                                className="px-3.5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                              >
                                Ignore
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAcceptTask(task)}
                                className="px-5 py-2.5 bg-[#055c24] hover:bg-[#033f18] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept Task</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Streak incentive subtext */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Accept 2 more deliveries before 8:00 PM to unlock your{' '}
                    <strong className="font-bold text-slate-900 dark:text-white">₹200 Evening Captain Streak</strong>.
                  </span>
                </span>
                <NavLink to="/rider/earnings" className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline shrink-0">
                  Details →
                </NavLink>
              </div>
            </>
          ) : (
            /* Offline Mode Heatmap & Shift Paused Card (stitch_dashboard_2) */
            <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 flex items-center justify-center">
                    <Radar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Nearby Order Heatmap (Paused)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live feed is muted while you are in offline mode
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  5+ Orders Queued Nearby
                </span>
              </div>

              {/* Callout box */}
              <div className="p-6 my-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  High Demand Active in Madhapur 100ft Road (+₹20 Surge)
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Kirana groceries, fresh dairy, and food deliveries are surging right now. Switch to Online Duty to view active dispatches and begin earning.
                </p>
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className="px-5 py-2.5 bg-[#055c24] hover:bg-[#033f18] text-white text-xs font-bold rounded-xl shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Switch to Online Duty</span>
                </button>
              </div>

              {/* Teaser summary pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Sri Lakshmi Kirana & More</span>
                    <span className="text-slate-400 text-[11px]">3 pending pickups nearby</span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ~₹75/trip
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Subbayya Gari Hot Meals</span>
                    <span className="text-slate-400 text-[11px]">2 urgent orders ready</span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ~₹60/trip
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Captain shift paused. You can resume any time before peak evening batch.
                </span>
                <NavLink to="/rider/earnings" className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline">
                  Shift Roster →
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT 4 COLS: Side Utility Widgets                           */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Widget 1: Daily Streak Target */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                Daily Streak Target
              </h4>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                6 / 10 Orders
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: '60%' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>6 Completed</span>
              <span className="font-bold text-slate-900 dark:text-white">Bonus: +₹200</span>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              Target resets tonight at 12:00 AM. 4 more orders needed.
            </p>
          </div>

          {/* Widget 2: High Demand Cluster Live Map Preview */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                High Demand Cluster
              </h4>
              <span className="text-[11px] bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                High Surge
              </span>
            </div>

            {/* Stylized Calm Map Visual */}
            <div className="h-36 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 relative overflow-hidden flex flex-col justify-end p-3">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#055c24_1px,transparent_1px)] [background-size:12px_12px]" />
              
              {/* Center Beacon */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 live-radar-ping absolute" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#055c24] border-2 border-white shadow-md relative z-10" />
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow whitespace-nowrap">
                  100ft Road (+₹20/ord)
                </span>
              </div>

              {/* Floating Bottom info */}
              <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-lg p-2.5 text-xs border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block text-[11px]">
                    Madhapur 100ft Road Cluster
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Avg wait time &lt; 3 mins
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.open('https://www.google.com/maps/dir/?api=1&destination=17.4480,78.3910', '_blank');
                  }}
                  className="px-2.5 py-1 bg-[#055c24] text-white font-semibold text-[11px] rounded-lg hover:bg-[#033f18] transition cursor-pointer"
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* Widget 3: Cash Handover Hub Card (Remittance Hub) */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-3 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Remittance Hub #04</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kavuri Hills Hub (600m away)</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700 text-xs mb-3 space-y-1.5">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Cash to Deposit:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{riderProfile.cashInHand}.00</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Allowed Hub Limit:</span>
                <span>₹2,000.00</span>
              </div>
            </div>

            <button
              type="button"
              onClick={openRemitModal}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Generate Hub Remit QR</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
