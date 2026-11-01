import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import soundService from '../services/soundService';

export default function SplashScreen({ onComplete }) {
  const navigate = useNavigate();
  const { quickSwitchRole } = useAuth();
  const { currentCity, selectedLocality } = useLocation();

  const [show, setShow] = useState(() => {
    return !sessionStorage.getItem('manamart_splashed');
  });

  // Reduced to 2.0 seconds as explicitly requested
  const TOTAL_SECONDS = 2.0;
  const [remainingTime, setRemainingTime] = useState(TOTAL_SECONDS);
  const [isPaused, setIsPaused] = useState(false);
  const [isRedirected, setIsRedirected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Telemetry Progress state scaled for 2.0 seconds
  const [telemetryPercent, setTelemetryPercent] = useState(88);
  const [telemetryStatus, setTelemetryStatus] = useState('Initializing Hyperlocal Network...');
  const [telemetryDetail, setTelemetryDetail] = useState(
    'Connecting trusted neighborhood kiranas & rythu bazaars...'
  );

  const lastTickRef = useRef(2);

  // Scaled 2-second telemetry progression
  useEffect(() => {
    if (!show) return;

    const timer1 = setTimeout(() => {
      setTelemetryPercent(94);
      setTelemetryStatus('Linking Local Kiranas & Rythu Mandis...');
      setTelemetryDetail('Connected neighborhood stores in Madhapur radius...');
    }, 600);

    const timer2 = setTimeout(() => {
      setTelemetryPercent(98);
      setTelemetryStatus('Calibrating Fast Delivery Lanes...');
      setTelemetryDetail('Rider dispatch node ready. Optimal route: 15-20 mins.');
    }, 1200);

    const timer3 = setTimeout(() => {
      setTelemetryPercent(100);
      setTelemetryStatus('ManaMart Engine Ready!');
      setTelemetryDetail('Launching verified local stores for instant access.');
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [show]);

  // Main 100ms Countdown Timer Loop
  useEffect(() => {
    if (!show || isPaused || isRedirected) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          handleTriggerRedirect();
          return 0;
        }
        const nextTime = Math.max(0, +(prev - 0.1).toFixed(1));

        const wholeSec = Math.ceil(nextTime);
        if (wholeSec !== lastTickRef.current && wholeSec > 0) {
          lastTickRef.current = wholeSec;
          if (soundEnabled) {
            try {
              soundService.playRiderChirp();
            } catch (_) {}
          }
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [show, isPaused, isRedirected, soundEnabled]);

  const handleTriggerRedirect = () => {
    if (isRedirected) return;
    setIsRedirected(true);
    if (soundEnabled) {
      try {
        soundService.playDealDing();
      } catch (_) {}
    }

    setTimeout(() => {
      sessionStorage.setItem('manamart_splashed', 'true');
      setShow(false);
      if (onComplete) onComplete();
    }, 500);
  };

  // Quick Role Direct Launch
  const handleQuickRoleLaunch = async (role) => {
    sessionStorage.setItem('manamart_splashed', 'true');
    setShow(false);
    await quickSwitchRole(role);
    if (role === 'merchant') navigate('/merchant');
    else if (role === 'rider') navigate('/rider');
    else if (role === 'admin') navigate('/admin');
    else navigate('/app');
  };

  if (!show) return null;

  // SVG circular countdown progress
  const CIRCUMFERENCE = 100.5;
  const progressRatio = Math.max(0, remainingTime / TOTAL_SECONDS);
  const strokeOffset = (1 - progressRatio) * CIRCUMFERENCE;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4, ease: 'easeOut' } }}
        className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#fff8ef] min-h-screen text-[#1e1b15] select-none overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 ${
          reducedMotion ? 'motion-reduced' : ''
        }`}
      >
        {/* Ambient Radiant Mesh & Floating Vector Tokens */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ef] via-[#faf3e8] to-[#f4ede2] opacity-90" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#fe6b00]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 left-1/3 w-[550px] h-[400px] bg-[#003527]/10 rounded-full blur-3xl animate-pulse" />

          {/* Floating Micro Elements with Local Hyperlocal Icons (Hidden on mobile for generous whitespace) */}
          <div className="hidden lg:flex absolute top-20 left-16 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-[#bfc9c3]/30 items-center gap-2.5 text-[#003527] font-bold text-xs">
            <span className="material-symbols-outlined text-[#fe6b00] text-lg">
              shopping_basket
            </span>
            <span>Fresh Rythu Bazaars</span>
          </div>

          <div className="hidden lg:flex absolute top-24 right-16 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-[#bfc9c3]/30 items-center gap-2.5 text-[#003527] font-bold text-xs">
            <span className="material-symbols-outlined text-[#003527] text-lg">
              storefront
            </span>
            <span>Authentic Kirana Stores</span>
          </div>

          <div className="hidden lg:flex absolute bottom-28 left-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-[#bfc9c3]/30 items-center gap-2.5 text-[#003527] font-bold text-xs">
            <span className="material-symbols-outlined text-[#fe6b00] text-lg">
              moped
            </span>
            <span>15–30 Min Neighborhood Delivery</span>
          </div>

          <div className="hidden lg:flex absolute bottom-24 right-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-[#bfc9c3]/30 items-center gap-2.5 text-[#003527] font-bold text-xs">
            <span className="material-symbols-outlined text-[#003527] text-lg">
              temple_hindu
            </span>
            <span>Mana Ooru Heritage</span>
          </div>
        </div>

        {/* Top Header Bar: Locality Pill, Language Selector, Sound & Skip */}
        <header className="relative z-20 w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 py-1">
          {/* Active Hub Locality Pill */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#bfc9c3]/40 px-3.5 py-1.5 rounded-full shadow-xs text-xs">
            <span className="material-symbols-outlined text-[#fe6b00] text-base animate-pulse">
              location_on
            </span>
            <span className="font-semibold text-[#003527]">
              Detected: {selectedLocality || 'Madhapur'}, {currentCity || 'Hyderabad'} • 500081
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-[#003527] font-bold">
              Live Hub
            </span>
          </div>

          {/* Right Controls: Audio, Language, Motion & Skip */}
          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundService.playDealDing();
              }}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-[#bfc9c3]/40 text-[#1e1b15] hover:text-[#003527] transition-all text-xs font-semibold shadow-xs"
              title="Toggle Interactive Sound Effects"
            >
              <span className="material-symbols-outlined text-sm text-[#fe6b00]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span className="hidden sm:inline">{soundEnabled ? 'Audio ON' : 'Muted'}</span>
            </button>

            {/* Language Pills */}
            <div className="bg-white/90 backdrop-blur-md border border-[#bfc9c3]/40 p-0.5 rounded-full flex items-center shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                  selectedLang === 'en'
                    ? 'bg-[#003527] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('te')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                  selectedLang === 'te'
                    ? 'bg-[#003527] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleTriggerRedirect}
              type="button"
              className="px-3.5 py-1.5 rounded-full bg-[#003527] text-white font-bold text-xs hover:bg-[#064e3b] transition-colors shadow-xs flex items-center gap-1"
            >
              <span>Skip</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </header>

        {/* Main Central Showcase: Spacious, Elegant & Uncongested */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-6 sm:py-10 my-auto w-full">
          {/* Logo with Soft Ambient Glow */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-sm sm:max-w-md px-4 mb-4"
          >
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-300/30 via-orange-300/30 to-emerald-300/30 rounded-full blur-2xl opacity-60" />
            <img
              src="/logo.png"
              alt="ManaMart — Mana Ooru. Mana Market."
              className="relative w-full h-auto object-contain max-h-28 sm:max-h-36 mx-auto select-none drop-shadow-md"
            />
          </motion.div>

          {/* Trust Tagline */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#003527] tracking-tight">
            Mana Ooru. Mana Market.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mt-1.5 leading-relaxed font-medium">
            Connecting trusted neighborhood kiranas, fresh morning rythu bazaars, and traditional artisans to your doorstep in 15–30 minutes.
          </p>

          {/* 2-SECOND INTERACTIVE COUNTDOWN TIMER WIDGET (Spacious & Clean) */}
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl border border-emerald-900/15 rounded-2xl p-4 sm:p-5 shadow-sm mt-6 mb-4 transition-all">
            <div className="flex items-center justify-between gap-4">
              {/* Circular Ring & Status Text */}
              <div className="flex items-center gap-3.5 text-left min-w-0">
                <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center">
                  <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3.2"
                    />
                    <path
                      className="stroke-[#fe6b00] transition-all duration-100 ease-linear"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray="100.5"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#fe6b00] font-mono">
                    {remainingTime.toFixed(1)}s
                  </span>
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#003527] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#fe6b00] text-sm animate-spin">
                        autorenew
                      </span>
                      <span>Auto-launching Marketplace</span>
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-[#a04100] uppercase tracking-wider">
                      2s Auto
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Entering verified local stores in{' '}
                    <strong className="text-[#fe6b00] font-bold">
                      {remainingTime.toFixed(1)}s
                    </strong> • Instant access ready
                  </p>
                </div>
              </div>

              {/* Pause & Enter Now Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#003527] text-slate-700 hover:text-[#003527] bg-slate-50 hover:bg-slate-100 transition-all text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isPaused ? 'play_arrow' : 'pause'}
                  </span>
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerRedirect}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#fe6b00] to-[#fd5a05] hover:opacity-95 text-white transition-all text-xs font-bold shadow-xs active:scale-95"
                >
                  <span>Enter Now</span>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </button>
              </div>
            </div>

            {/* Smooth linear countdown track */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fe6b00] via-orange-400 to-[#003527] transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Telemetry Bar & Live Network Badges */}
          <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-[#bfc9c3]/40 rounded-2xl p-4 shadow-xs mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#fe6b00] animate-ping" />
                <span className="text-xs font-bold text-[#003527]">{telemetryStatus}</span>
              </div>
              <span className="text-xs font-black text-[#fe6b00] font-mono">{telemetryPercent}%</span>
            </div>

            {/* Progress Fill */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#003527] via-[#fe6b00] to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${telemetryPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-left flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-[#003527]">radar</span>
              <span>{telemetryDetail}</span>
            </p>

            {/* Badges Bento */}
            <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
                <span className="text-xs font-bold text-[#003527]">42,000+</span>
                <span className="text-[10px] text-slate-500 font-medium">Verified Stores</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
                <span className="text-xs font-bold text-[#fe6b00]">15-Min</span>
                <span className="text-[10px] text-slate-500 font-medium">Delivery Lane</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
                <span className="text-xs font-bold text-emerald-700">100% Genuine</span>
                <span className="text-[10px] text-slate-500 font-medium">MRP Direct</span>
              </div>
            </div>
          </div>

          {/* Quick Action Gateway: Main Enter Button + Test Role Chips */}
          <div className="w-full max-w-xl flex flex-col items-center gap-3">
            <button
              onClick={handleTriggerRedirect}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#003527] to-[#064e3b] hover:from-[#064e3b] hover:to-[#003527] text-white py-3 px-6 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <span>Enter ManaMart Marketplace</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>

            {/* Quick Demo Role Chips with Comfortable Hit Targets */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
              <span className="text-xs text-slate-500 font-semibold mr-1">Sample Role Login:</span>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('customer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#003527] text-xs font-bold text-[#003527] hover:bg-emerald-50 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('merchant')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#fe6b00] text-xs font-bold text-[#fe6b00] hover:bg-orange-50 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">point_of_sale</span>
                <span>Merchant</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('rider')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#003527] text-xs font-bold text-[#003527] hover:bg-emerald-50 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">two_wheeler</span>
                <span>Rider Partner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-800 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>Admin</span>
              </button>
            </div>
          </div>
        </main>

        {/* Ambient Trust & Compliance Ticker Footer */}
        <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center text-xs text-slate-500 border-t border-slate-200/60 pt-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 font-medium">
            <span className="text-[#003527] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Zero Dark Warehouses
            </span>
            <span>•</span>
            <span className="text-[#fe6b00] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">favorite</span>
              Direct Support to Local Shopkeepers
            </span>
            <span>•</span>
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Government MeitY & ONDC Aligned
            </span>
          </div>
          <div className="font-mono text-[11px]">
            © 2025 ManaMart Hyperlocal Technologies Pvt Ltd.
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
