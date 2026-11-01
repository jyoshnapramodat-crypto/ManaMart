import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Official ManaMart Brand Logo Component
 * Uses the authentic ManaMart logo artwork provided by the user:
 * - Curving green road leading to the vibrant orange map pin with shopping cart
 * - Neighborhood stores and South Indian temple Gopuram skyline
 * - Bold "Mana" in forest green (#006837) & "Mart" in gradient orange (#FF5A00)
 * - Tagline: "— Mana Ooru. Mana Market. —"
 */
export default function Logo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  showTagline = true,
  iconOnly = false,
  variant = 'light',
  to = '/',
  className = '',
}) {
  const sizeStyles = {
    sm: {
      height: 'h-8 sm:h-9',
      iconWidth: 'w-8 h-8',
      text: 'text-lg',
      tagline: 'text-[9px]',
    },
    md: {
      height: 'h-10 sm:h-12',
      iconWidth: 'w-10 h-10',
      text: 'text-xl sm:text-2xl',
      tagline: 'text-[10px] sm:text-[11px]',
    },
    lg: {
      height: 'h-14 sm:h-16',
      iconWidth: 'w-14 h-14',
      text: 'text-2xl sm:text-3xl',
      tagline: 'text-xs sm:text-sm',
    },
    xl: {
      height: 'h-20 sm:h-24',
      iconWidth: 'w-20 h-20',
      text: 'text-3xl sm:text-4xl',
      tagline: 'text-sm sm:text-base',
    },
    hero: {
      height: 'h-24 sm:h-32 md:h-36',
      iconWidth: 'w-24 h-24 sm:w-32 sm:h-32',
      text: 'text-4xl sm:text-5xl',
      tagline: 'text-base sm:text-lg',
    },
  }[size] || {
    height: 'h-10 sm:h-12',
    iconWidth: 'w-10 h-10',
    text: 'text-xl sm:text-2xl',
    tagline: 'text-[10px] sm:text-[11px]',
  };

  const logoContent = (
    <div className={`inline-flex items-center space-x-2 group select-none transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      {/* Official ManaMart Logo Artwork Banner */}
      <img
        src="/logo.png"
        alt="ManaMart — Mana Ooru. Mana Market."
        className={`${sizeStyles.height} w-auto object-contain drop-shadow-sm filter contrast-105`}
        loading="eager"
      />
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
