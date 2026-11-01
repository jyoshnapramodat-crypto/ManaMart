import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Official ManaMart Brand Logo Component
 * Incorporates the official brand colors:
 * - Forest Green (#0C8340) -> "Mana Ooru" / Fresh & Hyperlocal
 * - Sunset Orange (#FF5E1E) -> "Mana Market" / Speed & Commerce
 * - Warm Amber (#F59E0B) -> Dynamic Delivery Spark
 */
export default function Logo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  iconOnly = false,
  variant = 'light', // 'light' (on light bg) | 'dark' (on dark bg)
  to = '/',
  className = '',
}) {
  const sizeClasses = {
    sm: {
      icon: 'w-7 h-7',
      text: 'text-lg',
      tagline: 'text-[9px]',
      badge: 'text-[9px] px-1 py-0.2',
    },
    md: {
      icon: 'w-9 h-9 sm:w-10 sm:h-10',
      text: 'text-xl sm:text-2xl',
      tagline: 'text-[10px] sm:text-[11px]',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    lg: {
      icon: 'w-12 h-12 sm:w-14 sm:h-14',
      text: 'text-2xl sm:text-3xl',
      tagline: 'text-xs sm:text-sm',
      badge: 'text-[10px] px-2 py-0.5',
    },
    xl: {
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      text: 'text-3xl sm:text-4xl',
      tagline: 'text-sm sm:text-base',
      badge: 'text-xs px-2.5 py-1',
    },
  }[size] || sizeClasses.md;

  const textPrimary = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const taglineColor = variant === 'dark' ? 'text-slate-300' : 'text-slate-500';

  const logoContent = (
    <div className={`inline-flex items-center space-x-2.5 group select-none ${className}`}>
      {/* High-Fidelity Vector SVG Icon */}
      <div className={`relative ${sizeClasses.icon} flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Rounded Squircle Container */}
          <rect
            width="64"
            height="64"
            rx="18"
            fill="url(#mm-bg-gradient)"
          />

          {/* Left Wing / 'M' Loop - Forest Green */}
          <path
            d="M16 45V24C16 19.5817 19.5817 16 24 16C27.2023 16 29.9723 17.8837 31.25 20.6125L32 22.25L32.75 20.6125C34.0277 17.8837 36.7977 16 40 16C44.4183 16 48 19.5817 48 24V45"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />

          {/* Foreground Stylized Double-Loop M */}
          {/* Left Arc: Green Leaf Motif */}
          <path
            d="M18 43V26C18 21.5817 21.5817 18 26 18C29.3137 18 32 20.6863 32 24V42"
            stroke="#0C8340"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Right Arc: Sunset Orange Shopping Basket Arc */}
          <path
            d="M32 24C32 20.6863 34.6863 18 38 18C42.4183 18 46 21.5817 46 26V43"
            stroke="#FF5E1E"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Fast Delivery Center Bolt / Spark */}
          <path
            d="M32 25L30 33H34L32 41"
            stroke="#FBBF24"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Local Loop Accent Dot */}
          <circle cx="32" cy="18" r="3" fill="#FF5E1E" />

          {/* Gradients */}
          <defs>
            <linearGradient id="mm-bg-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBF5" />
              <stop offset="1" stopColor="#F5EFE6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Block */}
      {!iconOnly && (
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5 leading-none">
            <span className={`font-black tracking-tight ${sizeClasses.text}`}>
              <span className="text-[#0C8340]">Mana</span>
              <span className="text-[#FF5E1E]">Mart</span>
            </span>
            <span
              className={`font-extrabold uppercase rounded-full bg-orange-100 text-[#FF5E1E] border border-orange-200/80 tracking-wider ${sizeClasses.badge}`}
            >
              Hyperlocal
            </span>
          </div>

          {showTagline && (
            <div className={`font-semibold tracking-wide flex items-center space-x-1 mt-0.5 ${sizeClasses.tagline} ${taglineColor}`}>
              <span className="text-[#0C8340] font-bold">మన ఊరు.</span>
              <span className="text-[#FF5E1E] font-bold">మన మార్కెట్.</span>
              <span className="opacity-60 hidden sm:inline">| Neighborhood Delivered</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
