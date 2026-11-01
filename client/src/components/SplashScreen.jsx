import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Only show once per browser session
    const hasSplashed = sessionStorage.getItem('manamart_splashed');
    if (hasSplashed) {
      setShow(false);
      if (onComplete) onComplete();
      return;
    }

    // Auto-dismiss smoothly after 3.5 seconds if user does not click
    const autoTimer = setTimeout(() => {
      handleDismiss();
    }, 3500);

    return () => clearTimeout(autoTimer);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('manamart_splashed', 'true');
    setShow(false);
    if (onComplete) onComplete();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, y: -16, transition: { duration: 0.6, ease: 'easeOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-container-lowest transition-all duration-700 ease-out p-space-lg backdrop-blur-md select-none"
        id="splashScreen"
        onClick={(e) => {
          if (e.target.id === 'splashScreen') handleDismiss();
        }}
      >
        <div className="max-w-xl w-full flex flex-col items-center text-center">
          {/* Animated Brand Showcase */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md mb-space-md p-space-sm rounded-xl bg-surface-bright shadow-level-2 border border-outline-variant/30"
          >
            <img
              src="/logo.png"
              alt="ManaMart"
              className="w-full h-auto object-contain max-h-36 mx-auto animate-soft-pulse"
            />
          </motion.div>

          {/* Live Tagline and Regional Micro-indicator */}
          <div className="inline-flex items-center gap-space-xs bg-surface-container-low px-space-md py-1 rounded-full mb-space-sm border border-outline-variant/40">
            <span
              className="material-symbols-outlined text-secondary text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            <span className="text-label-md font-label-md text-primary font-bold">
              Hyderabad Hyperlocal Grid • Live in 50+ Hubs
            </span>
          </div>

          <h2 className="text-headline-md font-headline-md font-bold text-primary mb-space-xs tracking-tight">
            Mana Ooru. Mana Market.
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-sm mb-space-lg">
            Bridging the warmth of local Indian kiranas and fresh bazaars with instant 15-30 minute doorstep fulfillment.
          </p>

          {/* Dismiss / Enter Marketplace CTA */}
          <button
            onClick={handleDismiss}
            className="flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg font-label-md text-label-md shadow-level-2 transition-all duration-200 active:scale-95 group cursor-pointer"
          >
            <span>Enter Marketplace</span>
            <span className="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
          <span className="text-label-sm font-label-sm text-outline mt-space-sm">
            Press to start shopping now
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
