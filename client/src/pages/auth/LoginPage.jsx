import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtp, quickSwitchRole } = useAuth();

  // Active Selected Role: 'customer' | 'merchant' | 'rider' | 'admin'
  const [selectedRole, setSelectedRole] = useState('customer');

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
      setError('Please enter your mobile number or email address.');
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
      setError('Please enter your registered mobile number or email.');
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

  // Quick Switcher for evaluation
  const handleQuickDemo = async (role) => {
    await quickSwitchRole(role);
    if (role === 'merchant') navigate('/merchant');
    else if (role === 'rider') navigate('/rider');
    else if (role === 'admin') navigate('/admin');
    else navigate('/app');
  };

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Minimal Auth Header */}
      <header className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-space-sm px-space-md md:px-margin-desktop sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <Link to="/" aria-label="ManaMart Home" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="ManaMart Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-space-xs pl-space-md border-l border-outline-variant/40">
              <span className="inline-flex items-center text-secondary font-label-sm text-label-sm bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px] mr-1">lock</span>
                256-Bit SSL Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow py-space-lg md:py-space-xl px-space-md md:px-margin-desktop max-w-7xl mx-auto w-full">
        {/* Portal Header & Role Switcher Banner */}
        <div className="text-center max-w-2xl mx-auto mb-space-lg md:mb-space-xl">
          <span className="inline-flex items-center gap-1 text-primary-container bg-primary-fixed/60 px-3 py-1 rounded-full font-label-sm text-label-sm mb-2 font-bold">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            Unified Identity & Role Portal
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight">
            Welcome to ManaMart
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-1">
            Select your role below to access your tailored neighborhood ecosystem dashboard.
          </p>
        </div>

        {/* Role Selection Tabs / Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm md:gap-space-md mb-space-xl">
          {/* Role 1: Customer */}
          <button
            type="button"
            onClick={() => setSelectedRole('customer')}
            className={`text-left p-space-md rounded-xl transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-surface-container-lowest border-2 border-primary-container custom-shadow ring-2 ring-primary-container/20'
                : 'bg-surface-container-lowest border border-outline-variant/50 hover:border-primary-container hover:shadow-md'
            }`}
          >
            {selectedRole === 'customer' && (
              <div className="absolute -top-3 right-3 bg-primary-container text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full shadow-sm font-bold">
                Active Role
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-fixed/70 text-primary-container flex items-center justify-center mb-space-sm">
                <span className="material-symbols-outlined text-[24px]">shopping_basket</span>
              </div>
              <h2 className="text-base font-bold text-on-surface">Customer</h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Shop local groceries, pharmacy, food & essentials with fast doorstep delivery.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center text-primary-container font-label-sm text-label-sm gap-1 font-bold">
              <span>Sign In / Register</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </div>
          </button>

          {/* Role 2: Merchant / Shop Owner */}
          <button
            type="button"
            onClick={() => setSelectedRole('merchant')}
            className={`text-left p-space-md rounded-xl transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedRole === 'merchant'
                ? 'bg-surface-container-lowest border-2 border-secondary custom-shadow ring-2 ring-secondary/20'
                : 'bg-surface-container-lowest border border-outline-variant/50 hover:border-secondary hover:shadow-md'
            }`}
          >
            {selectedRole === 'merchant' && (
              <div className="absolute -top-3 right-3 bg-secondary text-on-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-full shadow-sm font-bold">
                Active Role
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-secondary-fixed/70 text-secondary flex items-center justify-center mb-space-sm">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </div>
              <h2 className="text-base font-bold text-on-surface">Merchant / Shop</h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                List your store, manage inventory, reach thousands of nearby customers.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center text-secondary font-label-sm text-label-sm gap-1 font-bold">
              <span>Seller Portal</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </div>
          </button>

          {/* Role 3: Delivery Partner */}
          <button
            type="button"
            onClick={() => setSelectedRole('rider')}
            className={`text-left p-space-md rounded-xl transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedRole === 'rider'
                ? 'bg-surface-container-lowest border-2 border-primary custom-shadow ring-2 ring-primary/20'
                : 'bg-surface-container-lowest border border-outline-variant/50 hover:border-primary hover:shadow-md'
            }`}
          >
            {selectedRole === 'rider' && (
              <div className="absolute -top-3 right-3 bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full shadow-sm font-bold">
                Active Role
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-primary-fixed-variant flex items-center justify-center mb-space-sm">
                <span className="material-symbols-outlined text-[24px]">two_wheeler</span>
              </div>
              <h2 className="text-base font-bold text-on-surface">Delivery Partner</h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Earn flexible weekly payouts, deliver in your familiar neighborhood.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center text-primary font-label-sm text-label-sm gap-1 font-bold">
              <span>Rider Portal</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </div>
          </button>

          {/* Role 4: Administrator */}
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`text-left p-space-md rounded-xl transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-surface-container-lowest border-2 border-inverse-surface custom-shadow ring-2 ring-inverse-surface/20'
                : 'bg-surface-container-lowest border border-outline-variant/50 hover:border-inverse-surface hover:shadow-md'
            }`}
          >
            {selectedRole === 'admin' && (
              <div className="absolute -top-3 right-3 bg-inverse-surface text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full shadow-sm font-bold">
                Active Role
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-surface-dim text-inverse-surface flex items-center justify-center mb-space-sm">
                <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-on-surface">Administrator</h2>
                <span className="bg-error-container text-on-error-container text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Restricted
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Internal Operations, compliance control, and city-level dispatch management.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center text-on-surface font-label-sm text-label-sm gap-1 font-bold">
              <span>Staff Login</span>
              <span className="material-symbols-outlined text-[14px]">lock</span>
            </div>
          </button>
        </div>

        {/* Dynamic Card Container for Login & Identity Verification */}
        <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/40 custom-shadow p-space-lg md:p-space-xl">
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {selectedRole.toUpperCase()} LOGIN & ACCESS
              </span>
              <h3 className="text-lg font-bold text-on-surface">
                {selectedRole === 'customer' && 'Customer Neighborhood Access'}
                {selectedRole === 'merchant' && 'Merchant Shop Console Access'}
                {selectedRole === 'rider' && 'Delivery Partner Portal Access'}
                {selectedRole === 'admin' && 'Staff Governance Terminal Access'}
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
              100% Verified
            </span>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Customer / Merchant / Rider / Admin Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Switcher: Password vs OTP */}
            <div className="flex bg-surface-container-low p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  loginMode === 'password'
                    ? 'bg-white text-primary shadow-xs font-extrabold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('otp')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  loginMode === 'otp'
                    ? 'bg-white text-secondary shadow-xs font-extrabold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Instant OTP Login
              </button>
            </div>

            {/* Mobile / Email Input */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Registered Mobile Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9848022338 or customer@manamart.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 text-on-surface text-sm outline-none bg-surface-container-lowest"
                required
              />
            </div>

            {/* Password Login Mode */}
            {loginMode === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-on-surface">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 text-on-surface text-sm outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* OTP Login Mode */}
            {loginMode === 'otp' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-Digit OTP"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant focus:border-primary-container text-on-surface text-sm font-mono tracking-widest text-center outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpCooldown > 0}
                    className="px-4 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-outline-variant transition-colors disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>

                {otpDeliveryNote && (
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">mark_email_read</span>
                    {otpDeliveryNote}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-level-1 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                </>
              )}
            </button>
          </form>

          {/* New User Links & Onboarding Redirection */}
          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {selectedRole === 'customer' ? (
              <span className="text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline">
                  Register as Customer
                </Link>
              </span>
            ) : selectedRole === 'merchant' ? (
              <span className="text-on-surface-variant">
                Want to list your shop?{' '}
                <Link to="/merchant/apply" className="text-secondary font-bold hover:underline">
                  Register Your Store
                </Link>
              </span>
            ) : selectedRole === 'rider' ? (
              <span className="text-on-surface-variant">
                Want to join delivery fleet?{' '}
                <Link to="/rider/apply" className="text-primary font-bold hover:underline">
                  Partner as Rider
                </Link>
              </span>
            ) : (
              <span className="text-outline text-[11px]">
                Authorized personnel only. Audit logged 24/7.
              </span>
            )}

            {/* Quick Demo Switcher Buttons */}
            <div className="flex items-center gap-1 text-[11px] text-outline">
              <span>Quick Test:</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="hover:text-primary font-bold underline"
              >
                Customer
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('merchant')}
                className="hover:text-secondary font-bold underline"
              >
                Merchant
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('rider')}
                className="hover:text-primary font-bold underline"
              >
                Rider
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-4 text-center text-xs text-outline border-t border-outline-variant/30 bg-surface-container-lowest">
        © 2025 ManaMart Hyperlocal Technologies Pvt Ltd. Mana Ooru. Mana Market.
      </footer>
    </div>
  );
}
