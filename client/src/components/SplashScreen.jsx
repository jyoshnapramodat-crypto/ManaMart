import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Detecting your neighborhood...');

  useEffect(() => {
    // Only show once per browser session
    const hasSplashed = sessionStorage.getItem('manamart_splashed');
    if (hasSplashed) {
      setShow(false);
      if (onComplete) onComplete();
      return;
    }

    const t1 = setTimeout(() => {
      setLoadingStep('Locating neighborhood stores & riders...');
    }, 900);

    const t2 = setTimeout(() => {
      setLoadingStep('Mana Ooru. Mana Market. Ready!');
    }, 1800);

    const t3 = setTimeout(() => {
      handleFinish();
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleFinish = () => {
    sessionStorage.setItem('manamart_splashed', 'true');
    setShow(false);
    if (onComplete) onComplete();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.5, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-[#FCFBF7] overflow-hidden select-none"
      >
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute top-1/4 -left-28 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-28 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Tagline Pill */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 pt-4"
        >
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-orange-200/80 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-800 tracking-wide">
              <span className="text-[#006837]">మన ఊరు.</span> <span className="text-[#FF5A00]">మన మార్కెట్.</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500">Hyperlocal Network</span>
          </div>
        </motion.div>

        {/* Central Logo & Animation Canvas */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto w-full my-auto py-8">
          
          {/* Animated Logo Container with Glow */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 22,
              duration: 0.9,
            }}
            className="relative w-full flex flex-col items-center"
          >
            {/* Glowing Backlight Halo */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="absolute -inset-6 rounded-4xl bg-gradient-to-r from-[#006837]/15 via-[#FBBF24]/20 to-[#FF5A00]/25 blur-2xl -z-10"
            />

            {/* Official Logo Banner Card */}
            <div className="p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-4xl shadow-xl border border-white/80 max-w-lg w-full flex items-center justify-center">
              <img
                src="/logo.png"
                alt="ManaMart — Mana Ooru. Mana Market."
                className="w-full max-h-48 sm:max-h-56 object-contain filter drop-shadow-md"
              />
            </div>
          </motion.div>

          {/* Tagline & Subtext */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 space-y-2"
          >
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Your Entire Neighborhood, Delivered in 15–30 Mins.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              Restaurants • Kirana Stores • 24x7 Pharmacies • Bakeries • Parcel Delivery
            </p>
          </motion.div>

          {/* Shimmering Progress Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.8, ease: 'easeInOut' }}
            className="w-56 sm:w-64 h-2 bg-slate-200/80 rounded-full mt-8 overflow-hidden relative shadow-inner"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-[#006837] via-[#FBBF24] to-[#FF5A00]"
            />
          </motion.div>

          {/* Live Dynamic Status Text */}
          <motion.div
            key={loadingStep}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center space-x-2 text-xs font-bold text-slate-600 mt-3"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF5A00] animate-bounce" />
            <span>{loadingStep}</span>
          </motion.div>
        </div>

        {/* Bottom Bar: Skip / Direct Entry */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 pb-4 flex items-center justify-between w-full max-w-xl text-xs text-slate-400"
        >
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-600">Local Verified Partners</span>
          </div>

          <button
            onClick={handleFinish}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs hover:shadow-xs transition-all"
          >
            <span>Enter Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5A00]" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
