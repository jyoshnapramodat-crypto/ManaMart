import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import soundService from '../services/soundService';

export default function SplashScreen({ onComplete }) {
  const navigate = useNavigate();
  const { currentCity, selectedLocality } = useLocation();

  const [show, setShow] = useState(() => {
    return !sessionStorage.getItem('manamart_splashed');
  });

  // Snappy, ultra-fast 0.8s splash animation duration as explicitly requested
  const TOTAL_SECONDS = 0.8;
  const [remainingTime, setRemainingTime] = useState(TOTAL_SECONDS);
  const [isRedirected, setIsRedirected] = useState(false);
  const [telemetryPercent, setTelemetryPercent] = useState(88);
  const [telemetryStatus, setTelemetryStatus] = useState('Initializing Hyperlocal Network...');

  // Snappy telemetry progression over 0.8s
  useEffect(() => {
    if (!show) return;

    const timer1 = setTimeout(() => {
      setTelemetryPercent(96);
      setTelemetryStatus('Linking Local Kiranas & Rythu Bazaars...');
    }, 250);

    const timer2 = setTimeout(() => {
      setTelemetryPercent(100);
      setTelemetryStatus('ManaMart Engine Ready!');
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [show]);

  // Main Countdown Timer Loop (ticks every 50ms for smooth 0.8s transition)
  useEffect(() => {
    if (!show || isRedirected) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0.05) {
          clearInterval(interval);
          handleTriggerRedirect();
          return 0;
        }
        return Math.max(0, +(prev - 0.05).toFixed(2));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [show, isRedirected]);

  const handleTriggerRedirect = () => {
    if (isRedirected) return;
    setIsRedirected(true);

    try {
      soundService.playDealDing();
    } catch (_) {}

    setTimeout(() => {
      sessionStorage.setItem('manamart_splashed', 'true');
      setShow(false);
      if (onComplete) onComplete();
    }, 300);
  };

  if (!show) return null;

  const progressRatio = Math.max(0, remainingTime / TOTAL_SECONDS);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.25, ease: 'easeOut' } }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#fff8ef] min-h-screen text-[#1e1b15] select-none overflow-y-auto overflow-x-hidden p-6 sm:p-8 lg:p-12"
      >
        {/* Soft Ambient Background Mesh */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ef] via-[#faf3e8] to-[#f4ede2] opacity-90" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#fe6b00]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[450px] h-[350px] bg-[#003527]/10 rounded-full blur-3xl" />
        </div>

        {/* Top Header: Simple, Clean & Spacious */}
        <header className="relative z-20 w-full max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#bfc9c3]/40 px-3.5 py-1.5 rounded-full shadow-xs text-xs">
            <span className="material-symbols-outlined text-[#fe6b00] text-base animate-pulse">
              location_on
            </span>
            <span className="font-semibold text-[#003527]">
              {selectedLocality || 'Madhapur'}, {currentCity || 'Hyderabad'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-[#003527] font-bold">
              Live Hub
            </span>
          </div>

          <button
            onClick={handleTriggerRedirect}
            type="button"
            className="px-4 py-1.5 rounded-full bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1 active:scale-95"
          >
            <span>Skip</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </header>

        {/* Center Hero: Spacious, Elegant & High-Contrast */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-8 my-auto w-full">
          {/* Logo with Soft Glow */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-sm sm:max-w-md px-4 mb-4"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-300/30 via-orange-300/30 to-emerald-300/30 rounded-full blur-2xl opacity-60" />
            <img
              src="/logo.png"
              alt="ManaMart — Mana Ooru. Mana Market."
              className="relative w-full h-auto object-contain max-h-24 sm:max-h-32 mx-auto select-none drop-shadow-md"
            />
          </motion.div>

          {/* Tagline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003527] tracking-tight">
            Mana Ooru. Mana Market.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-2 leading-relaxed font-medium">
            Connecting trusted neighborhood kiranas, fresh morning rythu bazaars, and local stores in 15–30 minutes.
          </p>

          {/* Snappy Progress Strip */}
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-emerald-900/15 rounded-2xl p-4 shadow-xs mt-6 mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#003527] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#fe6b00] animate-ping" />
                <span>{telemetryStatus}</span>
              </div>
              <span className="font-mono text-[#fe6b00]">{telemetryPercent}%</span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fe6b00] via-orange-400 to-[#003527] transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${(1 - progressRatio) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
              <span>Verified local hubs connected</span>
              <span className="font-semibold text-[#003527]">Auto-launching...</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <button
              onClick={handleTriggerRedirect}
              className="w-full flex items-center justify-center gap-2 bg-[#064E3B] hover:bg-[#033B2D] text-white py-3 px-6 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Enter ManaMart Marketplace</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </main>

        {/* Bottom Trust Ribbon */}
        <footer className="relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center text-xs text-slate-500 border-t border-slate-200/60 pt-3">
          <div className="flex items-center gap-3 font-medium">
            <span className="text-[#003527] font-semibold">✓ Zero Dark Warehouses</span>
            <span>•</span>
            <span className="text-[#fe6b00] font-semibold">✓ 100% Local Kiranas & Shops</span>
          </div>
          <div className="font-mono text-[11px]">
            © 2025 ManaMart Hyperlocal Technologies Pvt Ltd.
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
