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
  const [quickLoadingRole, setQuickLoadingRole] = useState(null);
  const [error, setError] = useState(null);

  // Sample Demo Accounts Data for 1-Click Testing (Zero personal information required!)
  const sampleAccounts = [
    {
      role: 'customer',
      title: 'Customer',
      name: 'Ravi Kumar',
      phone: '9876543210',
      email: 'ravi.kumar@example.com',
      password: 'password123',
      color: 'border-primary/40 bg-surface-container-lowest hover:border-primary',
      badgeBg: 'bg-primary/10 text-primary',
      icon: 'shopping_basket',
      desc: 'Shop local kirana groceries, medicines & book restaurant tables with 2 preloaded Hyderabad addresses.',
      actionPath: '/app',
    },
    {
      role: 'merchant',
      title: 'Restaurant Owner',
      name: 'Sridhar Rao',
      storeName: 'Swagath Grand Kitchen',
      phone: '9848012345',
      email: 'sridhar@swagathgrand.com',
      password: 'password123',
      color: 'border-secondary/40 bg-surface-container-lowest hover:border-secondary',
      badgeBg: 'bg-secondary/10 text-secondary',
      icon: 'storefront',
      desc: 'Active restaurant owner with live food orders, BookMyShow-style table reservations & menu management.',
      actionPath: '/merchant',
    },
    {
      role: 'rider',
      title: 'Delivery Hero',
      name: 'Suresh Varma',
      phone: '9123456780',
      email: 'suresh.rider@manamart.in',
      password: 'password123',
      color: 'border-primary-container/40 bg-surface-container-lowest hover:border-primary-container',
      badgeBg: 'bg-primary-container/10 text-primary-container',
      icon: 'two_wheeler',
      desc: 'Active neighborhood delivery partner with live order dispatch queue, GPS turn-by-turn & daily earnings.',
      actionPath: '/rider',
    },
    {
      role: 'admin',
      title: 'Super Admin',
      name: 'Admin Chief',
      phone: '9999999999',
      email: 'admin@manamart.in',
      password: 'password123',
      color: 'border-inverse-surface/40 bg-surface-container-lowest hover:border-inverse-surface',
      badgeBg: 'bg-inverse-surface/10 text-inverse-surface',
      icon: 'admin_panel_settings',
      desc: 'Platform governance: approve merchant shops, verify rider documents, monitor citywide orders & revenue.',
      actionPath: '/admin',
    },
  ];

  // Auto-fill credentials into form
  const handleAutoFill = (acc) => {
    setSelectedRole(acc.role);
    setIdentifier(acc.phone);
    setPassword(acc.password);
    setLoginMode('password');
    setError(null);
  };

  // 1-Click Instant Login for Test Sample Account
  const handle1ClickLogin = async (acc) => {
    setQuickLoadingRole(acc.role);
    setError(null);
    try {
      await quickSwitchRole(acc.role);
      const destination = location.state?.from?.pathname || location.state?.from || acc.actionPath;
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Quick login failed. Please try form login.');
    } finally {
      setQuickLoadingRole(null);
    }
  };

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

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-primary">
      {/* Top Header */}
      <header className="w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="ManaMart Home" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="ManaMart Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-outline-variant/30 text-xs">
              <span className="inline-flex items-center text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[13px] mr-1">lock</span>
                256-Bit SSL Secured
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto w-full">
        {/* Portal Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-1 text-primary bg-primary-fixed/60 px-3 py-1 rounded-full text-xs mb-2 font-bold">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            Unified Identity & Role Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Welcome to ManaMart
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Test any role immediately below without entering your personal information, or use your registered credentials.
          </p>
        </div>

        {/* Redirect Notice Banner if arriving from a protected feature like Dine-In Booking */}
        {location.state?.message && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs shadow-xs animate-fadeIn">
            <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">lock</span>
            <div className="flex-1">
              <span className="font-bold block">Authentication Required</span>
              <span>{location.state.message}</span>
            </div>
          </div>
        )}

        {/* 🌟 SAMPLE DEMO ACCOUNTS: 1-CLICK INSTANT LOGIN FOR EVERY ROLE */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-lg">science</span>
              <h2 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">
                Sample Test Accounts (1-Click Instant Login)
              </h2>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              No personal data required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {sampleAccounts.map((acc) => (
              <div
                key={acc.role}
                className={`p-3.5 rounded-xl border shadow-xs transition-all flex flex-col justify-between ${acc.color}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${acc.badgeBg}`}>
                      {acc.title}
                    </span>
                    <span className="material-symbols-outlined text-lg text-outline">
                      {acc.icon}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-on-surface">
                    {acc.name}
                  </h3>
                  {acc.storeName && (
                    <span className="text-[11px] text-secondary font-bold block">
                      {acc.storeName}
                    </span>
                  )}

                  <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                    {acc.desc}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-outline-variant/20 text-[11px] font-mono space-y-0.5 text-outline">
                    <div>📱 Phone: <span className="text-on-surface font-semibold">{acc.phone}</span></div>
                    <div>🔑 Pass: <span className="text-on-surface font-semibold">{acc.password}</span></div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handle1ClickLogin(acc)}
                    disabled={quickLoadingRole === acc.role}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {quickLoadingRole === acc.role ? (
                      <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">bolt</span>
                    )}
                    <span>1-Click Sign In as {acc.title}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutoFill(acc)}
                    className="w-full py-1 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant font-semibold text-[11px] transition-colors"
                  >
                    Fill in Form Below
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STANDARD SIGN-IN FORM */}
        <div className="max-w-md mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs p-5 sm:p-6">
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                {selectedRole.toUpperCase()} LOGIN
              </span>
              <h3 className="text-sm sm:text-base font-bold text-on-surface">
                {selectedRole === 'customer' && 'Customer Neighborhood Access'}
                {selectedRole === 'merchant' && 'Restaurant & Kirana Console'}
                {selectedRole === 'rider' && 'Delivery Partner Fleet Portal'}
                {selectedRole === 'admin' && 'Platform Governance Terminal'}
              </h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
              Role: {selectedRole}
            </span>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mb-3.5 p-2.5 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Mode Switcher: Password vs OTP */}
            <div className="flex bg-surface-container p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  loginMode === 'password'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('otp')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  loginMode === 'otp'
                    ? 'bg-white text-secondary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Instant OTP Login
              </button>
            </div>

            {/* Mobile / Email Input */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Mobile Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or ravi.kumar@example.com"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-xs sm:text-sm outline-none bg-surface-container-lowest"
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
                    className="text-xs font-semibold text-secondary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. password123)"
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-xs sm:text-sm outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* OTP Login Mode */}
            {loginMode === 'otp' && (
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-Digit OTP"
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 focus:border-primary text-on-surface text-xs sm:text-sm font-mono tracking-widest text-center outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpCooldown > 0}
                    className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs border border-outline-variant/40 transition-colors disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? `Resend ${otpCooldown}s` : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>

                {otpDeliveryNote && (
                  <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">mark_email_read</span>
                    <span>{otpDeliveryNote}</span>
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                </>
              )}
            </button>
          </form>

          {/* New User Redirection */}
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="text-secondary font-bold hover:underline">
                Register as Customer
              </Link>
            </span>
            <Link to="/merchant/apply" className="text-primary font-semibold hover:underline">
              Partner Shop →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 text-center text-xs text-on-surface-variant border-t border-outline-variant/20 bg-surface-container-low">
        © 2025 ManaMart Hyperlocal Technologies Pvt Ltd. Mana Ooru. Mana Market.
      </footer>
    </div>
  );
}
