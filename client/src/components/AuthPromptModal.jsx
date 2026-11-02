import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { X, ShoppingBag, ArrowRight, Heart, User, UserPlus } from 'lucide-react';

export default function AuthPromptModal({ isOpen, onClose, title, message, returnAction }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleRedirectLogin = () => {
    onClose();
    navigate('/login', { state: { from: location } });
  };

  const handleRedirectSignup = () => {
    onClose();
    navigate('/register', { state: { from: location } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header with Logo */}
        <div className="p-6 bg-gradient-to-br from-[#064E3B]/10 via-orange-50/50 to-amber-50/30 border-b border-slate-100 relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-2">
            <Logo size="sm" showSubtitle={true} />
          </div>

          <h3 className="text-lg font-black text-slate-900 mt-3">
            {title || 'Join Your Neighborhood on ManaMart'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
            {message || 'Sign in to place orders, track live neighborhood delivery, follow local stores, and save your favorites!'}
          </p>
        </div>

        {/* Benefits summary */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-orange-950 font-medium">
              <ShoppingBag className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
              <span>Multi-store cart & order tracking</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950 font-medium">
              <Heart className="w-4 h-4 text-[#064E3B] flex-shrink-0" />
              <span>Follow shops & daily alerts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleRedirectLogin}
              className="py-3 px-4 rounded-2xl bg-[#064E3B] hover:bg-[#033B2D] text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={handleRedirectSignup}
              className="py-3 px-4 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
