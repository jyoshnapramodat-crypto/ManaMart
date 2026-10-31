import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, sendOtp, checkAvailability, quickSwitchRole, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpHint, setLoginOtpHint] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('customer'); // 'customer' | 'merchant' | 'rider'
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regVehicleType, setRegVehicleType] = useState('bike');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpHint, setRegOtpHint] = useState('');
  const [regError, setRegError] = useState(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Live availability checks
  const [phoneStatus, setPhoneStatus] = useState(null); // { available: bool, message: string }
  const [emailStatus, setEmailStatus] = useState(null);

  // Debounced check for phone uniqueness
  useEffect(() => {
    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      const timer = setTimeout(async () => {
        const res = await checkAvailability(cleanPhone, null);
        setPhoneStatus(res);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPhoneStatus(null);
    }
  }, [regPhone]);

  // Debounced check for email uniqueness
  useEffect(() => {
    const cleanEmail = regEmail.trim();
    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      const timer = setTimeout(async () => {
        const res = await checkAvailability(null, cleanEmail);
        setEmailStatus(res);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setEmailStatus(null);
    }
  }, [regEmail]);

  // Handle Login Send OTP
  const handleLoginSendOtp = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your phone number or email.');
      return;
    }

    setLoginLoading(true);
    const res = await sendOtp(loginIdentifier, 'login');
    setLoginLoading(false);

    if (res.success) {
      setLoginOtpSent(true);
      setLoginOtpHint(res.demoHint || `Use OTP: ${res.otp || '1234'}`);
    } else {
      setLoginError(res.message);
      if (res.notRegistered) {
        // Prompt user to switch to Register
        setRegPhone(loginIdentifier.replace(/\D/g, ''));
        if (loginIdentifier.includes('@')) setRegEmail(loginIdentifier);
      }
    }
  };

  // Handle Login Verify
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginOtp.trim()) {
      setLoginError('Please enter the 4-digit OTP.');
      return;
    }

    setLoginLoading(true);
    const res = await login(loginIdentifier, loginOtp);
    setLoginLoading(false);

    if (res.success) {
      // Redirect based on role
      const userRole = res.user.role;
      if (userRole === 'merchant') navigate('/merchant');
      else if (userRole === 'rider') navigate('/rider');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setLoginError(res.message);
    }
  };

  // Handle Register Send OTP
  const handleRegSendOtp = async (e) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regPhone.trim() && !regEmail.trim()) {
      setRegError('Please provide at least a phone number or email.');
      return;
    }

    if (phoneStatus && !phoneStatus.available) {
      setRegError('This phone number is already registered. Please sign in or use another number.');
      return;
    }

    if (emailStatus && !emailStatus.available) {
      setRegError('This email is already registered. Please sign in or use another email.');
      return;
    }

    setRegLoading(true);
    const primaryId = regPhone.trim() || regEmail.trim();
    const res = await sendOtp(primaryId, 'register');
    setRegLoading(false);

    if (res.success) {
      setRegOtpSent(true);
      setRegOtpHint(res.demoHint || `Use OTP: ${res.otp || '1234'}`);
    } else {
      setRegError(res.message);
    }
  };

  // Handle Register Final Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);

    setRegLoading(true);
    const res = await register({
      name: regName,
      phone: regPhone,
      email: regEmail,
      role: regRole,
      otp: regOtp || '1234',
      businessName: regBusinessName,
      vehicleType: regVehicleType,
    });
    setRegLoading(false);

    if (res.success) {
      setRegSuccess(true);
      setTimeout(() => {
        if (regRole === 'merchant') navigate('/merchant');
        else if (regRole === 'rider') navigate('/rider');
        else navigate('/');
      }, 1200);
    } else {
      setRegError(res.message);
    }
  };

  // Quick switcher wrapper
  const handleQuickDemo = async (role) => {
    await quickSwitchRole(role);
    if (role === 'merchant') navigate('/merchant');
    else if (role === 'rider') navigate('/rider');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>ManaMart Single Identity Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ManaMart Account Access
          </h1>
          <p className="text-xs text-slate-500">
            One unique account for your neighborhood commerce, deliveries & local services
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
          
          {/* Tabs: Sign In / Register */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <span>{loginError}</span>
                    {loginError.includes('register') && (
                      <button
                        onClick={() => setActiveTab('register')}
                        className="block font-bold text-orange-600 underline"
                      >
                        Create an account now →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!loginOtpSent ? (
                <form onSubmit={handleLoginSendOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Phone Number or Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or ravi@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 text-xs font-medium"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Works across Customer, Merchant, Rider Partner & Admin accounts
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    {loginLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send 4-Digit Login OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-orange-950 space-y-1">
                    <p className="font-bold">OTP sent to {loginIdentifier}</p>
                    <p className="text-[11px] text-orange-700 font-mono font-bold">{loginOtpHint}</p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Enter 4-Digit Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength="6"
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        placeholder="e.g. 1234"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 text-base font-mono font-bold tracking-widest text-center"
                        required
                        autoFocus
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setLoginOtpSent(false)}
                      className="w-1/3 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                    >
                      Change
                    </button>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-2/3 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold shadow-md flex items-center justify-center space-x-1.5"
                    >
                      {loginLoading ? <span>Verifying...</span> : <span>Verify & Sign In</span>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: REGISTER NEW UNIQUE ACCOUNT */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Account Created Successfully!</h3>
                  <p className="text-xs text-slate-500">Redirecting to your neighborhood dashboard...</p>
                </div>
              ) : !regOtpSent ? (
                <form onSubmit={handleRegSendOtp} className="space-y-3.5 text-xs">
                  {/* Role Selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      I am registering as:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('customer')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
                          regRole === 'customer'
                            ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <User className="w-4 h-4 text-orange-600" />
                        <span className="text-[11px] font-bold">Customer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('merchant')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
                          regRole === 'merchant'
                            ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Store className="w-4 h-4 text-orange-600" />
                        <span className="text-[11px] font-bold">Shop Owner</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('rider')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
                          regRole === 'rider'
                            ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Bike className="w-4 h-4 text-orange-600" />
                        <span className="text-[11px] font-bold">Rider</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Anand Varma"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 font-medium"
                      required
                    />
                  </div>

                  {/* If Merchant: Shop Name */}
                  {regRole === 'merchant' && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Business / Shop Name</label>
                      <input
                        type="text"
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="e.g. Sri Balaji Sweets & Bakery"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  )}

                  {/* If Rider: Vehicle Type */}
                  {regRole === 'rider' && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
                      <select
                        value={regVehicleType}
                        onChange={(e) => setRegVehicleType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
                      >
                        <option value="bike">Motorcycle (Petrol)</option>
                        <option value="scooter">Scooter / Activa</option>
                        <option value="ev">Electric Two-Wheeler (EV)</option>
                        <option value="bicycle">Bicycle</option>
                      </select>
                    </div>
                  )}

                  {/* Phone with Uniqueness Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Phone Number (Unique)</label>
                      {phoneStatus && (
                        <span
                          className={`text-[10px] font-bold ${
                            phoneStatus.available ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {phoneStatus.available ? '✓ Phone Available' : '❌ Already Registered'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border focus:outline-none ${
                          phoneStatus && !phoneStatus.available
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-slate-200 focus:border-orange-500'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Email with Uniqueness Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Email Address (Unique)</label>
                      {emailStatus && (
                        <span
                          className={`text-[10px] font-bold ${
                            emailStatus.available ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {emailStatus.available ? '✓ Email Available' : '❌ Already Registered'}
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. anand@example.com"
                      className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border focus:outline-none ${
                        emailStatus && !emailStatus.available
                          ? 'border-red-400 bg-red-50/30'
                          : 'border-slate-200 focus:border-orange-500'
                      }`}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading || (phoneStatus && !phoneStatus.available) || (emailStatus && !emailStatus.available)}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {regLoading ? <span>Validating...</span> : <span>Send Registration OTP</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                    <p className="font-bold">Verification code sent to {regPhone || regEmail}</p>
                    <p className="text-[11px] text-emerald-700 font-mono font-bold">{regOtpHint}</p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Enter 4-Digit Verification OTP
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 text-base font-mono font-bold tracking-widest text-center"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRegOtpSent(false)}
                      className="w-1/3 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md"
                    >
                      {regLoading ? <span>Creating...</span> : <span>Confirm & Create Account</span>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Frictionless One-Click Demo Logins */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Or Fast-Sign In With Sample Seed Accounts
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-700 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>Customer</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Ravi Kumar (9876543210)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('merchant')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-700 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <Store className="w-3.5 h-3.5 text-orange-600" />
                  <span>Merchant</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Swagath Kitchen (9848012345)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('rider')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-700 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <Bike className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rider</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Suresh Varma (9123456780)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-700 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Chief Admin (9999999999)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-slate-400">
          Protected by ManaMart 256-bit encryption. Strict phone & email uniqueness enforced.
        </p>
      </div>
    </div>
  );
}
