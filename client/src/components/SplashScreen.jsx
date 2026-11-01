import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

export default function SplashScreen({ onComplete }) {
  const navigate = useNavigate();
  const { quickSwitchRole } = useAuth();
  const { currentCity, selectedLocality } = useLocation();

  const [show, setShow] = useState(() => {
    // Check session storage
    return !sessionStorage.getItem('manamart_splashed');
  });

  // Countdown timer state (5.0 seconds down to 0)
  const TOTAL_SECONDS = 5.0;
  const [remainingTime, setRemainingTime] = useState(TOTAL_SECONDS);
  const [isPaused, setIsPaused] = useState(false);
  const [isRedirected, setIsRedirected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false); // Default muted, can toggle ON
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Telemetry Progress state
  const [telemetryPercent, setTelemetryPercent] = useState(88);
  const [telemetryStatus, setTelemetryStatus] = useState('Initializing Hyperlocal Network...');
  const [telemetryDetail, setTelemetryDetail] = useState(
    'Pinpointing Local Kiranas in Madhapur & Hyderabad clusters...'
  );

  const audioCtxRef = useRef(null);
  const lastTickRef = useRef(5);

  // Initialize Web Audio Engine (synthesizer with zero external assets)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setAudioInitialized(true);
  };

  const playTickSound = () => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1040, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (_) {}
  };

  const playLaunchChime = () => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // Uplifting D major fanfare
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + idx * 0.06 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.06 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.75);
      });
    } catch (_) {}
  };

  // Telemetry Progress Simulation
  useEffect(() => {
    if (!show) return;

    const timer1 = setTimeout(() => {
      setTelemetryPercent(93);
      setTelemetryStatus('Linking Local Kiranas & Rythu Mandis...');
      setTelemetryDetail('Connected 124 neighborhood stores in Madhapur radius...');
    }, 1400);

    const timer2 = setTimeout(() => {
      setTelemetryPercent(98);
      setTelemetryStatus('Calibrating Fast Delivery Lanes...');
      setTelemetryDetail('Rider dispatch node ready. Optimal route: 15-20 mins.');
    }, 2800);

    const timer3 = setTimeout(() => {
      setTelemetryPercent(100);
      setTelemetryStatus('ManaMart Engine Ready!');
      setTelemetryDetail('Launching verified local stores for instant access.');
    }, 4200);

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

        // Tick on whole seconds
        const wholeSec = Math.ceil(nextTime);
        if (wholeSec !== lastTickRef.current && wholeSec > 0) {
          lastTickRef.current = wholeSec;
          playTickSound();
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [show, isPaused, isRedirected, soundEnabled]);

  const handleTriggerRedirect = () => {
    if (isRedirected) return;
    setIsRedirected(true);
    playLaunchChime();

    setTimeout(() => {
      sessionStorage.setItem('manamart_splashed', 'true');
      setShow(false);
      if (onComplete) onComplete();
    }, 700);
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

  const toggleSound = () => {
    if (!audioInitialized) initAudio();
    setSoundEnabled((prev) => !prev);
  };

  if (!show) return null;

  // Circumference calculation for SVG circle (r = 15.9155 => circumference = 100.0)
  const CIRCUMFERENCE = 100.5;
  const progressRatio = Math.max(0, remainingTime / TOTAL_SECONDS);
  const strokeOffset = (1 - progressRatio) * CIRCUMFERENCE;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.5, ease: 'easeOut' } }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-surface min-h-screen text-on-surface select-none overflow-x-hidden p-4 sm:p-6"
      >
        {/* Ambient Radiant Mesh & Floating Vector Tokens */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ef] via-[#faf3e8] to-[#f4ede2] opacity-95"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-secondary-container/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-[450px] h-[350px] bg-primary-container/10 rounded-full blur-3xl animate-pulse"></div>

          {/* Floating Micro Elements with Local Hyperlocal Icons (Stitch Zip 8) */}
          <div className="hidden md:flex absolute top-16 left-12 lg:left-24 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-outline-variant/30 items-center gap-2 text-primary font-bold text-xs">
            <span className="material-symbols-outlined text-secondary-container text-base">
              shopping_basket
            </span>
            <span>Fresh Rythu Bazaars</span>
          </div>

          <div className="hidden md:flex absolute top-28 right-12 lg:right-24 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-outline-variant/30 items-center gap-2 text-primary font-bold text-xs">
            <span className="material-symbols-outlined text-primary-container text-base">
              storefront
            </span>
            <span>Authentic Kirana Stores</span>
          </div>

          <div className="hidden md:flex absolute bottom-28 left-10 lg:left-20 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-outline-variant/30 items-center gap-2 text-primary font-bold text-xs">
            <span className="material-symbols-outlined text-secondary-container text-base">
              two_wheeler
            </span>
            <span>15–30 Min Neighborhood Delivery</span>
          </div>

          <div className="hidden md:flex absolute bottom-24 right-10 lg:right-28 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-outline-variant/30 items-center gap-2 text-primary font-bold text-xs">
            <span className="material-symbols-outlined text-primary-container text-base">
              temple_hindu
            </span>
            <span>Mana Ooru Heritage</span>
          </div>
        </div>

        {/* Top Header Controls: Hub Telemetry & Sound */}
        <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Active Hub Locality Pill */}
          <div className="flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/40 px-3.5 py-1.5 rounded-full shadow-xs text-xs">
            <span className="material-symbols-outlined text-secondary-container text-sm animate-pulse">
              location_on
            </span>
            <span className="font-semibold text-primary">
              Detected: {selectedLocality || 'Madhapur'}, {currentCity || 'Hyderabad'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
              Live Hub
            </span>
          </div>

          {/* Sound & Skip */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 border border-outline-variant/40 text-on-surface hover:text-primary transition-all text-xs font-semibold shadow-xs"
              title="Toggle Interactive Sound Effects"
            >
              <span className="material-symbols-outlined text-sm text-secondary-container">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span>{soundEnabled ? 'Audio ON' : 'Muted'}</span>
            </button>
            <button
              onClick={handleTriggerRedirect}
              type="button"
              className="px-3 py-1 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-colors shadow-xs"
            >
              Skip
            </button>
          </div>
        </header>

        {/* Main Central Showcase: Animated ManaMart Logo & Countdown */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-3">
          {/* Official Logo with Soft Backlight Glow and Breathing Animation */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-md px-4 mb-3"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-fixed/30 via-secondary-container/20 to-primary-fixed-dim/30 rounded-3xl blur-2xl opacity-60"></div>
            <img
              src="/logo.png"
              alt="ManaMart — Mana Ooru. Mana Market."
              className="relative w-full h-auto object-contain max-h-32 sm:max-h-40 mx-auto select-none"
            />
          </motion.div>

          {/* Tagline */}
          <h2 className="font-headline-sm text-base sm:text-lg font-bold text-primary tracking-tight">
            Mana Ooru. Mana Market.
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-md mt-1 leading-relaxed">
            Connecting trusted neighborhood kiranas, fresh morning rythu bazaars, and traditional artisans to your doorstep in 15–30 minutes.
          </p>

          {/* 3 TO 5 SECOND INTERACTIVE COUNTDOWN TIMER WIDGET (Stitch Zip 8) */}
          <div className="w-full max-w-lg bg-surface-container-lowest/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-3 sm:p-3.5 shadow-sm mt-4 mb-3">
            <div className="flex items-center justify-between gap-3">
              {/* Countdown ring & status text */}
              <div className="flex items-center gap-3 text-left min-w-0">
                {/* SVG Circular Countdown Progress */}
                <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3.2"
                    ></path>
                    <path
                      className="stroke-secondary-container transition-all duration-100 ease-linear"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray="100.5"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    ></path>
                  </svg>
                  <span className="absolute font-headline-sm text-xs font-extrabold text-secondary">
                    {Math.ceil(remainingTime)}s
                  </span>
                </div>

                {/* Message & Status */}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-xs font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary-container text-sm animate-spin">
                        autorenew
                      </span>
                      <span>Auto-launching Marketplace</span>
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-secondary-fixed text-on-secondary-fixed uppercase tracking-wider">
                      Auto
                    </span>
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate mt-0.5">
                    Entering verified local stores in{' '}
                    <strong className="text-secondary font-semibold">
                      {remainingTime.toFixed(1)}s
                    </strong>
                  </p>
                </div>
              </div>

              {/* Interactive Controls: Pause/Resume + Enter Now */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant/60 hover:border-primary text-on-surface hover:text-primary bg-surface-container-low transition-all text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isPaused ? 'play_arrow' : 'pause'}
                  </span>
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerRedirect}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-secondary-container hover:bg-secondary text-on-primary transition-all text-xs font-bold shadow-xs active:scale-95"
                >
                  <span>Enter Now</span>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </button>
              </div>
            </div>

            {/* Linear Progress Strip */}
            <div className="w-full bg-surface-container rounded-full h-1 mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary-container to-primary transition-all duration-100 ease-linear"
                style={{ width: `${progressRatio * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Live Network Initialization & Telemetry Badges */}
          <div className="w-full max-w-lg bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/40 rounded-2xl p-3.5 shadow-xs mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
                <span className="text-xs font-semibold text-primary">{telemetryStatus}</span>
              </div>
              <span className="text-xs font-bold text-secondary">{telemetryPercent}%</span>
            </div>

            {/* Progress Fill */}
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-primary via-secondary-container to-primary-fixed rounded-full transition-all duration-500"
                style={{ width: `${telemetryPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1.5 text-left flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">radar</span>
              <span>{telemetryDetail}</span>
            </p>

            {/* Badges Bento */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-outline-variant/20">
              <div className="flex flex-col items-center p-1.5 rounded-lg bg-surface-container">
                <span className="text-xs font-bold text-primary">42,000+</span>
                <span className="text-[10px] text-on-surface-variant">Verified Stores</span>
              </div>
              <div className="flex flex-col items-center p-1.5 rounded-lg bg-surface-container">
                <span className="text-xs font-bold text-secondary">15-Min</span>
                <span className="text-[10px] text-on-surface-variant">Delivery Lane</span>
              </div>
              <div className="flex flex-col items-center p-1.5 rounded-lg bg-surface-container">
                <span className="text-xs font-bold text-primary-container">100% Genuine</span>
                <span className="text-[10px] text-on-surface-variant">MRP Direct</span>
              </div>
            </div>
          </div>

          {/* Quick Role Test Access Gateway (1-Click Instant Testing for Every Role) */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2">
            <button
              onClick={handleTriggerRedirect}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99]"
            >
              <span>Enter ManaMart Marketplace</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>

            {/* Quick Demo Role Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
              <span className="text-[11px] text-on-surface-variant font-semibold">Test Any Role:</span>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('customer')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-primary text-xs font-semibold text-primary hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-sm">shopping_basket</span>
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('merchant')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-secondary text-xs font-semibold text-secondary hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Restaurant/Kirana</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('rider')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-primary text-xs font-semibold text-primary hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-sm">two_wheeler</span>
                <span>Delivery Hero</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLaunch('admin')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:border-on-surface text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>Super Admin</span>
              </button>
            </div>
          </div>
        </main>

        {/* Minimal Bottom Trust Ribbon */}
        <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center text-[11px] text-on-surface-variant border-t border-outline-variant/20 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-primary font-semibold">✓ Zero Dark Warehouses</span>
            <span>•</span>
            <span className="text-secondary font-semibold">✓ 100% Local Community Support</span>
          </div>
          <div>© 2025 ManaMart Technologies Pvt Ltd. Mana Ooru. Mana Market.</div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
