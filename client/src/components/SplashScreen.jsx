import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if splash was already shown during this browser session
    const hasSplashed = sessionStorage.getItem('manamart_splashed');
    if (hasSplashed) {
      setShow(false);
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      handleFinish();
    }, 2400);

    return () => clearTimeout(timer);
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
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.45, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FCFBF8] overflow-hidden select-none"
      >
        {/* Soft Ambient Radial Glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Brand Animation Box */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
          
          {/* Animated Emblem Ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              duration: 0.7,
            }}
            className="relative mb-6"
          >
            {/* Pulsing Backlight Ring */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#0C8340]/20 via-[#FF5E1E]/25 to-amber-300/30 blur-xl"
            />

            {/* Official Logo Display */}
            <div className="relative p-3 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/60">
              <Logo size="xl" showTagline={false} to={null} />
            </div>
          </motion.div>

          {/* Staggered Title Reveal */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center space-x-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Hyperlocal Commerce Ecosystem</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              <span className="text-[#0C8340]">Mana</span>
              <span className="text-[#FF5E1E]">Mart</span>
            </h1>

            <p className="text-base sm:text-lg font-bold text-slate-700 tracking-tight">
              <span className="text-[#0C8340]">మన ఊరు.</span>{' '}
              <span className="text-[#FF5E1E]">మన మార్కెట్.</span>
            </p>

            <p className="text-xs text-slate-500 font-medium">
              Your Entire Neighborhood, Delivered in 15–30 Mins.
            </p>
          </motion.div>

          {/* Shimmering Progress Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{ delay: 0.6, duration: 1.5, ease: 'easeInOut' }}
            className="w-48 h-1.5 bg-slate-200 rounded-full mt-8 overflow-hidden relative"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-[#0C8340] via-amber-400 to-[#FF5E1E]"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-[11px] font-semibold text-slate-400 mt-3"
          >
            Connecting local shops, restaurants & riders...
          </motion.p>

          {/* Skip Button */}
          <button
            onClick={handleFinish}
            className="mt-6 inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Skip intro</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
