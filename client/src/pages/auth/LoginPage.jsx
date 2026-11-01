import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import {
  User,
  Store,
  Bike,
  ShieldCheck,
  Mail,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtp, quickSwitchRole } = useAuth();

  // Login Mode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpDeliveryNote, setOtpDeliveryNote] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your registered mobile number or email address.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(cleanId, 'login');
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpCooldown(res.cooldownSeconds || 60);
      setOtpDeliveryNote(res.message || 'A 6-digit verification code has been dispatched.');
    } else {
      setError(res.message || 'Failed to dispatch verification code.');
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your mobile number or email.');
      return;
    }

    if (loginMode === 'password' && !password) {
      setError('Please enter your account password.');
      return;
    }

    if (loginMode === 'otp' && !otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const credentials = loginMode === 'password' ? { password } : { otp: otp.trim() };
    const res = await login(cleanId, credentials);
    setLoading(false);

    if (res.success) {
      // Check redirect destination
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const userRole = res.user.role;
      const userStatus = res.user.status;

      if (userRole === 'merchant') {
        if (userStatus === 'pending') navigate('/merchant/status');
        else navigate('/merchant');
      } else if (userRole === 'rider') {
        if (userStatus === 'pending') navigate('/rider/status');
        else navigate('/rider');
      } else if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  // Quick Switcher for test evaluation
  const handleQuickDemo = async (role) => {
    await quickSwitchRole(role);
    if (role === 'merchant') navigate('/merchant');
    else if (role === 'rider') navigate('/rider');
    else if (role === 'admin') navigate('/admin');
    else navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" showTagline={false} to="/" />
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>ManaMart Single Identity Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In to ManaMart
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Access your orders, store dashboard, or rider deliveries
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5">
          
          {/* Mode Switcher: Password vs OTP */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                loginMode === 'password'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In with Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                loginMode === 'otp'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In with OTP
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={loginMode === 'otp' && !otpSent ? handleSendOtp : handleSubmit} className="space-y-4">
            
            {/* Identifier: Mobile or Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or ramesh@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                />
                {identifier.includes('@') ? (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* Password Login Mode */}
            {loginMode === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
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
            )}

            {/* OTP Login Mode */}
            {loginMode === 'otp' && otpSent && (
              <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-orange-950 flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-orange-600" />
                    <span>6-Digit Verification Code</span>
                  </label>
                  {otpCooldown > 0 ? (
                    <span className="text-[11px] font-bold text-orange-700">
                      Resend in {otpCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-black py-2.5 rounded-xl border border-orange-300 bg-white text-slate-900 outline-none focus:ring-4 focus:ring-orange-200"
                />

                <p className="text-[11px] text-slate-500 leading-snug">
                  {otpDeliveryNote || 'A 6-digit code has been dispatched to your registered address.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {loginMode === 'otp' && !otpSent ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
            )}

          </form>

          {/* Direct link to Signup */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have a ManaMart account?{' '}
              <Link to="/signup" className="font-bold text-orange-600 hover:text-orange-700">
                Create Account here
              </Link>
            </p>
          </div>

        </div>

        {/* Quick Testing Sandbox */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">Quick Testing Sandbox:</span>
            <span className="text-[10px] text-emerald-400 font-semibold">1-Click Fast Preview</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => handleQuickDemo('customer')}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
            >
              Customer
            </button>
            <button
              onClick={() => handleQuickDemo('merchant')}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
            >
              Merchant
            </button>
            <button
              onClick={() => handleQuickDemo('rider')}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
            >
              Rider
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
