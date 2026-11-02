import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import {
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || null);

  // Auto-detect role and route seamlessly to the dedicated portal
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your full name, registered mobile number, or email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);

      if (res.success && res.user) {
        const user = res.user;
        const role = (user.role || 'CUSTOMER').toUpperCase();
        const status = (user.status || user.merchant_profile?.status || user.rider_profile?.status || '').toUpperCase();
        const isPending = status === 'PENDING' || status === 'PENDING_VERIFICATION' || status === 'UNDER_REVIEW' || status === 'CHANGES_REQUESTED';

        // 1. Merchant Role Auto-Route
        if (role === 'MERCHANT') {
          if (isPending) {
            navigate('/merchant/status');
          } else {
            navigate('/merchant/dashboard');
          }
          return;
        }

        // 2. Delivery Hero (Rider) Role Auto-Route
        if (role === 'RIDER') {
          if (isPending) {
            navigate('/rider/status');
          } else {
            navigate('/rider/dashboard');
          }
          return;
        }

        // 3. Admin Governance Auto-Route
        if (role === 'ADMIN') {
          navigate('/admin/analytics');
          return;
        }

        // 4. Customer Role Route (or previous location)
        const destination = location.state?.from?.pathname || '/';
        navigate(destination);
      } else {
        setError(res.message || 'Invalid credentials. Please verify your details.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'Authentication failed. Please verify your registered mobile number, email, or name and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-amber-900/10 bg-white/70 backdrop-blur-md">
        <Logo size="md" to="/" />
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#064E3B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to ManaMart
            </h1>
            <p className="text-xs text-slate-500">
              Enter your credentials to access your neighborhood account or merchant/rider console
            </p>
          </div>

          {/* Location state message / Error banner */}
          {location.state?.message && !error && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{location.state.message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Unified Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name, Mobile Number, or Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Ramesh Reddy, 9876543210, or user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-[#FF6B00] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dedicated Registration Links */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-center">
            <p className="text-slate-500">
              New customer?{' '}
              <Link to="/register" className="font-bold text-[#064E3B] hover:underline">
                Create a Customer Account
              </Link>
            </p>

            <div className="pt-2 border-t border-slate-100/60 grid grid-cols-2 gap-2 text-[11px]">
              <Link
                to="/merchant/register"
                className="p-2.5 rounded-xl border border-emerald-200 hover:border-[#064E3B] bg-emerald-50/40 text-[#064E3B] font-bold transition-all text-center flex flex-col items-center gap-1"
              >
                <Store className="w-4 h-4" />
                <span>Register Store</span>
              </Link>

              <Link
                to="/rider/register"
                className="p-2.5 rounded-xl border border-orange-200 hover:border-[#FF6B00] bg-orange-50/40 text-[#FF6B00] font-bold transition-all text-center flex flex-col items-center gap-1"
              >
                <Bike className="w-4 h-4" />
                <span>Join as Rider</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-amber-900/10">
        ManaMart — Mana Ooru. Mana Market.
      </footer>
    </div>
  );
}
