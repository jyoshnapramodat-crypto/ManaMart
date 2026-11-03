import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import { identifyPlaceByPincode } from '../../utils/pincodeLookup';
import {
  User,
  Store,
  Bike,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Check,
  ChevronDown,
  Tag,
  HelpCircle,
  Clock,
  Radio,
  Building2,
  Percent,
  Heart,
  Headphones,
  Zap,
} from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, sendOtp } = useAuth();

  // Read initial role from query params if passed: ?role=merchant | rider | customer
  const queryRole = new URLSearchParams(location.search).get('role');
  const [role, setRole] = useState(
    ['merchant', 'rider', 'customer'].includes(queryRole?.toLowerCase())
      ? queryRole.toLowerCase()
      : 'customer'
  );

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Dynamic Fields
  const [pincode, setPincode] = useState('500081');
  const [locality, setLocality] = useState('Madhapur / Hitech City');
  const [identifiedPlace, setIdentifiedPlace] = useState({
    locality: 'Madhapur / Hitech City',
    city: 'Hyderabad',
    district: 'Rangareddy',
    state: 'Telangana',
    placeName: 'Madhapur / Hitech City, Hyderabad',
  });
  const [isIdentifyingPin, setIsIdentifyingPin] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('Kirana & Staples (General Store)');
  const [vehicleType, setVehicleType] = useState('Motorcycle / Scooter (Petrol)');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Handle Automatic Place Identification on Pincode Change
  const handlePincodeChange = async (newPin) => {
    const clean = newPin.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);

    if (clean.length === 6) {
      setIsIdentifyingPin(true);
      const res = await identifyPlaceByPincode(clean);
      setIsIdentifyingPin(false);
      if (res && res.found) {
        setIdentifiedPlace(res);
        setLocality(res.locality);
      }
    } else {
      setIdentifiedPlace(null);
    }
  };

  const selectQuickPincode = async (quickPin, quickLocality) => {
    setPincode(quickPin);
    setIsIdentifyingPin(true);
    const res = await identifyPlaceByPincode(quickPin);
    setIsIdentifyingPin(false);
    if (res && res.found) {
      setIdentifiedPlace(res);
      setLocality(res.locality || quickLocality);
    } else {
      setLocality(quickLocality);
    }
  };

  // Referral State
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);

  // OTP & Verification Node State
  const [showOtpDashboard, setShowOtpDashboard] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCooldown, setOtpCooldown] = useState(24);
  const [demoOtpCode, setDemoOtpCode] = useState('482915');
  const otpInputRefs = useRef([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // OTP Countdown timer
  useEffect(() => {
    if (!showOtpDashboard || otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpDashboard, otpCooldown]);

  // Role Metadata & Perks
  const roleData = {
    customer: {
      id: 'customer',
      title: 'Customer',
      subtitle: 'Shop & Order',
      badge: '30s Instant',
      submitText: 'Send Verification OTP',
      emailHint: 'Optional for Shoppers',
      headerTitle: 'Shopper Welcome Crate',
      headerIcon: ShoppingBag,
      iconBg: 'bg-emerald-100 text-[#064E3B]',
      borderActive: 'border-[#064E3B] bg-emerald-50/20 shadow-xs ring-2 ring-emerald-500/10',
      perks: [
        {
          title: '₹150 Welcome Crate Voucher',
          desc: 'Instant discount on fresh produce and daily essentials on your 1st order.',
        },
        {
          title: '30 Days Unlimited Free Delivery',
          desc: 'From all neighborhood kirana stores, regional bakeries, and milk dairies.',
        },
        {
          title: '10-15 Min Hyperlocal Dispatch',
          desc: 'Items packed directly by your trusted corner shopkeeper, not dark warehouses.',
        },
      ],
      networkStat: '14,200+ Neighborhood Stores',
    },
    merchant: {
      id: 'merchant',
      title: 'Merchant',
      subtitle: 'Sell Online',
      badge: '0% Commission',
      submitText: 'Verify Store & Begin Onboarding',
      emailHint: 'Mandatory for GST Invoices',
      headerTitle: 'Store Partner Growth Kit',
      headerIcon: Store,
      iconBg: 'bg-orange-100 text-[#FF6B00]',
      borderActive: 'border-[#FF6B00] bg-orange-50/20 shadow-xs ring-2 ring-orange-500/10',
      perks: [
        {
          title: '0% Platform Onboarding Fee',
          desc: 'Zero listing charges. Keep 100% of your listed retail shelf pricing.',
        },
        {
          title: '24-Hour Digital Catalog Activation',
          desc: 'Our field executive photographs and uploads your 1,500+ items for free.',
        },
        {
          title: 'ONDC Network Distribution',
          desc: 'Your kirana catalog instantly visible across buyer apps and search.',
        },
      ],
      networkStat: '₹1.8 Cr+ Monthly Merchant GMV',
    },
    rider: {
      id: 'rider',
      title: 'Rider',
      subtitle: 'Gully Pilot',
      badge: 'Daily Payouts',
      submitText: 'Submit Pilot Application',
      emailHint: 'Recommended for Insurance',
      headerTitle: 'Pilot Earnings & Benefits',
      headerIcon: Bike,
      iconBg: 'bg-teal-100 text-teal-800',
      borderActive: 'border-teal-700 bg-teal-50/20 shadow-xs ring-2 ring-teal-500/10',
      perks: [
        {
          title: '100% Delivery Fare Retention',
          desc: 'Keep every rupee of delivery fees plus generous peak-hour burst surges.',
        },
        {
          title: 'Daily Evening Direct UPI Payouts',
          desc: 'No weekly waiting. Automatic credit to your linked bank account every night.',
        },
        {
          title: '₹5,00,000 Group Accident Insurance',
          desc: 'Complimentary on-duty medical coverage for you and your family.',
        },
      ],
      networkStat: '3,800+ Active Gully Pilots',
    },
  };

  const activeRoleData = roleData[role] || roleData.customer;

  // Password Strength Logic
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'text-slate-400', level: 0 };
    if (password.length < 6) return { label: 'Weak (< 6 chars)', color: 'text-red-500', level: 1 };
    if (password.length < 10) return { label: 'Good (Medium)', color: 'text-[#FF6B00]', level: 2 };
    return { label: 'Strong (Optimal)', color: 'text-[#064E3B]', level: 3 };
  };
  const strength = getPasswordStrength();

  // 1-Click Fill Demo Data
  const handleFillMockData = (targetRole = role) => {
    setName('K. Anitha Reddy');
    setPhone('9849012345');
    setEmail('anitha.reddy@gmail.com');
    setPassword('ManaMart#2025');
    setConfirmPassword('ManaMart#2025');
    if (targetRole === 'merchant') {
      setStoreName('Sri Sai Venkateswara Supermarket');
      setStoreCategory('Kirana & Staples (General Store)');
    } else if (targetRole === 'rider') {
      setLicenseNumber('DL-042023009842');
      setVehicleType('Motorcycle / Scooter (Petrol)');
    }
    setError(null);
  };

  // Generate OTP Action (Triggers the OTP Dashboard)
  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setOtpLoading(true);
    try {
      // Dispatch OTP request to backend
      const res = await sendOtp(cleanPhone, 'signup');
      if (res && res.success === false && res.isRegistered) {
        setError(res.message);
        setOtpLoading(false);
        return;
      }

      // Transition to OTP Security Dashboard
      setShowOtpDashboard(true);
      setOtpCooldown(24);
      setDemoOtpCode(res?.demoOtp || '482915');
      setSuccessNotice(`Verification OTP dispatched to +91 ${cleanPhone}. Please enter the 6-digit code below.`);

      // Focus first OTP field
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 200);
    } catch (err) {
      // In local dev, still reveal OTP dashboard for smooth development
      setShowOtpDashboard(true);
      setOtpCooldown(24);
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Digits Handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next field
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  const autoFillOtpCode = (code = demoOtpCode) => {
    const chars = code.split('').slice(0, 6);
    setOtpDigits(chars);
  };

  // Final Registration Submission
  const handleCompleteRegistration = async () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await register({
        name: name.trim(),
        phone: phone.trim().replace(/\D/g, '').slice(-10),
        email: email.trim().toLowerCase(),
        password,
        role: role.toLowerCase(),
        otp: enteredOtp,
        businessName: role === 'merchant' ? storeName : undefined,
        vehicleType: role === 'rider' ? vehicleType : undefined,
      });

      if (res.success) {
        // Direct redirect to the tailored dashboard for the created role
        if (role === 'merchant') {
          navigate('/merchant/dashboard');
        } else if (role === 'rider') {
          navigate('/rider/dashboard');
        } else {
          navigate('/app');
        }
      } else {
        setError(res.message || 'Registration verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOtpComplete = otpDigits.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-slate-900 flex flex-col font-sans selection:bg-[#FFE5D3] selection:text-[#FF6B00]">
      
      {/* ============================================================== */}
      {/* 1. TOP GLOBAL HEADER BAR                                       */}
      {/* ============================================================== */}
      <header className="w-full bg-white/95 border-b border-slate-200/80 py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo Anchor */}
          <Link to="/" className="flex items-center gap-2 focus:outline-none">
            <img
              src="/assets/official-logo.png"
              alt="ManaMart Logo"
              className="h-9 sm:h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>

          {/* Trust Badges & System Status (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#064E3B] rounded-full border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF6B00] rounded-full border border-orange-200/80">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>ONDC Hyperlocal Network</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Headphones className="w-4 h-4 text-slate-400" />
              <span>Help: <strong className="text-slate-800">1800-MANA-MART</strong></span>
            </div>
          </div>

          {/* Quick Action: Switch to Sign In */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">Already registered?</span>
            <Link
              to={`/login?role=${role}`}
              className="inline-flex items-center gap-1.5 text-[#064E3B] text-xs font-black px-3.5 py-1.5 rounded-xl border border-[#064E3B]/20 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN REGISTRATION CONTAINER                                 */}
      {/* ============================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Page Title & Ethos Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE5D3] text-[#A93800] text-[11px] font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Join ManaMart Hyperlocal Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Create Your Unified Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            One single account across neighborhood grocery ordering, local merchant cataloging, or express rider delivery.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="max-w-3xl mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Notice */}
        {successNotice && (
          <div className="max-w-3xl mx-auto p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Quick Sandbox Preview Bar */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 px-2 text-slate-500 text-xs font-bold">
            <Zap className="w-4 h-4 text-[#FF6B00]" />
            <span>Quick Sandbox Preview:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
            {['customer', 'merchant', 'rider'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                  role === r
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === 'customer' ? 'Customer (Shopper)' : r === 'merchant' ? 'Merchant (Kirana Partner)' : 'Rider (Gully Pilot)'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleFillMockData(role)}
              className="ml-1 px-3 py-1 rounded-xl font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>1-Click Fill</span>
            </button>
          </div>
        </div>

        {/* 2-Column Desktop Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Multi-Role Registration Form (7 cols)           */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
            
            {/* Interactive Role Selector Cards */}
            <div className="space-y-2">
              <label className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                <span>Select Your Primary Role</span>
                <span className="text-[11px] text-slate-400 font-normal">Can switch anytime later</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Customer Card */}
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    role === 'customer'
                      ? 'border-[#064E3B] bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    {role === 'customer' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="block font-black text-xs text-slate-900 leading-tight">Customer</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Shop & Order</span>
                  </div>
                  <span className="mt-2 text-[9px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded w-max">
                    30s Instant
                  </span>
                </button>

                {/* Merchant Card */}
                <button
                  type="button"
                  onClick={() => setRole('merchant')}
                  className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    role === 'merchant'
                      ? 'border-[#FF6B00] bg-orange-50/20 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    {role === 'merchant' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="block font-black text-xs text-slate-900 leading-tight">Merchant</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Sell Online</span>
                  </div>
                  <span className="mt-2 text-[9px] uppercase font-bold tracking-wider text-[#FF6B00] bg-orange-100/70 px-1.5 py-0.5 rounded w-max">
                    0% Commission
                  </span>
                </button>

                {/* Rider Card */}
                <button
                  type="button"
                  onClick={() => setRole('rider')}
                  className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    role === 'rider'
                      ? 'border-teal-700 bg-teal-50/20 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Bike className="w-4 h-4" />
                    </div>
                    {role === 'rider' ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="block font-black text-xs text-slate-900 leading-tight">Rider</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Gully Pilot</span>
                  </div>
                  <span className="mt-2 text-[9px] uppercase font-bold tracking-wider text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded w-max">
                    Daily Payouts
                  </span>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleGenerateOtp} className="space-y-5 text-xs">
              
              {/* Section 1: Contact & Personal Info */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs text-[#064E3B] flex items-center gap-1.5 pb-1 border-b border-slate-100 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Contact & Personal Info</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex">
                      <div className="inline-flex items-center gap-1 px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl font-bold text-slate-700 text-xs">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl font-medium focus:bg-white focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address with context tag */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Email Address</label>
                    <span className="text-[10px] font-semibold text-[#A93800] bg-[#FFE5D3] px-2 py-0.5 rounded-full">
                      {activeRoleData.emailHint}
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh.kumar@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Role Specific Dynamic Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-xs text-[#064E3B] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {role === 'customer'
                      ? 'Shopper Neighborhood Delivery Locality'
                      : role === 'merchant'
                      ? 'Store Trade & Category Specification'
                      : 'Delivery Hero Vehicle & Compliance'}
                  </span>
                </h4>

                {/* Customer Dynamic Fields */}
                {role === 'customer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Delivery Pincode *
                          </label>
                          {isIdentifyingPin && (
                            <span className="text-[10px] text-[#064E3B] font-bold animate-pulse">
                              Identifying place...
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => handlePincodeChange(e.target.value)}
                            placeholder="e.g. 500081"
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:border-[#064E3B] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Auto-Identified Locality / Mandal *
                        </label>
                        <input
                          type="text"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          placeholder="Locality auto-filled from pincode"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#064E3B] outline-none"
                        />
                      </div>
                    </div>

                    {/* Automatic Place Identification Live Badge */}
                    {identifiedPlace && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Identified: {identifiedPlace.locality}, {identifiedPlace.city} ({identifiedPlace.state})
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Verified Postal Zone
                        </span>
                      </div>
                    )}

                    {/* Quick Pincode Pills for Instant 1-Click Identification */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        Quick neighborhood pincodes (Click to auto-identify):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { pin: '500081', name: 'Madhapur' },
                          { pin: '500032', name: 'Gachibowli' },
                          { pin: '500072', name: 'KPHB' },
                          { pin: '500034', name: 'Banjara Hills' },
                          { pin: '500060', name: 'Dilsukhnagar' },
                          { pin: '522212', name: 'Narakoduru' },
                        ].map((item) => (
                          <button
                            key={item.pin}
                            type="button"
                            onClick={() => selectQuickPincode(item.pin, item.name)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                              pincode === item.pin
                                ? 'bg-[#064E3B] text-white border-[#064E3B]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {item.name} ({item.pin})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Merchant Dynamic Fields */}
                {role === 'merchant' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Kirana / Store Trade Name *
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Sri Lakshmi Kirana & Sweets"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#FF6B00] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Store Primary Category *
                      </label>
                      <select
                        value={storeCategory}
                        onChange={(e) => setStoreCategory(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#FF6B00] outline-none cursor-pointer"
                      >
                        <option>Kirana & Staples (General Store)</option>
                        <option>Fresh Produce (Rythu Fruits & Veg)</option>
                        <option>Dairy, Ghee & Regional Sweets</option>
                        <option>Local Chemist / Ayurvedic Pharma</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Rider Dynamic Fields */}
                {role === 'rider' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Vehicle Delivery Type *
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-teal-700 outline-none cursor-pointer"
                      >
                        <option>Motorcycle / Scooter (Petrol)</option>
                        <option>EV Two-Wheeler (Battery Swap)</option>
                        <option>Bicycle (Micro Gully Delivery)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Driving License / Aadhaar *
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="DL-042023009842"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-teal-700 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Security & Credentials */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs text-[#064E3B] flex items-center gap-1.5 pb-1 border-b border-slate-100 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>2. Security & Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Create Password */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RotateCcw className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Password Strength:</span>
                    <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full w-1/3 rounded-full transition-all ${
                        strength.level >= 1 ? (strength.level === 1 ? 'bg-red-500' : 'bg-[#FF6B00]') : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full w-1/3 rounded-full transition-all ${
                        strength.level >= 2 ? (strength.level === 2 ? 'bg-[#FF6B00]' : 'bg-[#064E3B]') : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full w-1/3 rounded-full transition-all ${
                        strength.level >= 3 ? 'bg-[#064E3B]' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Referral & Policy Acceptance */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                {/* Collapsible Referral Code Trigger */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowReferral(!showReferral)}
                    className="text-[#FF6B00] hover:text-[#A93800] text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Have a partner or neighbor referral code?</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${showReferral ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showReferral && (
                    <div className="mt-2 flex gap-2 max-w-sm animate-in fade-in">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="e.g. MANA-500"
                        className="uppercase w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-[#064E3B] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (referralCode) setReferralApplied(true);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {referralApplied && (
                    <span className="text-[11px] text-[#064E3B] font-bold block mt-1">
                      ✓ ₹150 discount unlocked on your first kirana basket!
                    </span>
                  )}
                </div>

                {/* T&C Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#064E3B] focus:ring-[#064E3B]/30 border-slate-300"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I agree to the{' '}
                    <a href="#" className="text-[#064E3B] font-bold hover:underline">
                      Terms of Service
                    </a>
                    ,{' '}
                    <a href="#" className="text-[#064E3B] font-bold hover:underline">
                      Privacy Policy
                    </a>
                    , and consent to receive transactional OTP verification over SMS / WhatsApp.
                  </span>
                </label>
              </div>

              {/* Primary Submit Button: Generate OTP */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-black text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-99 disabled:opacity-50"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Verification OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>{activeRoleData.submitText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Secure. No spam calls. ONDC registered protocol.</span>
                </p>
              </div>

            </form>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: DYNAMIC PERKS OR LIVE OTP DASHBOARD (5 cols)   */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* If OTP Dashboard is Active -> Live OTP Security Node pops up! */}
            {showOtpDashboard ? (
              <div className="bg-white rounded-3xl p-6 border-2 border-orange-300 ring-4 ring-orange-100 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
                
                {/* Node Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      LIVE OTP SECURITY NODE
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                    Ready
                  </span>
                </div>

                {/* Sub-header info */}
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Enter 6-Digit Verification Code
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>
                      Sent to <strong className="text-slate-800 font-mono">+91 {phone || '98765-43210'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOtpDashboard(false)}
                      className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </p>
                </div>

                {/* 6 OTP Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black rounded-2xl border-2 transition-all outline-none ${
                        digit
                          ? 'border-[#064E3B] bg-emerald-50/30 text-[#064E3B]'
                          : 'border-slate-300 bg-slate-50 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Resend Action & Countdown */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {otpCooldown > 0 ? (
                        <>Resend OTP in <strong className="font-mono text-slate-700">{otpCooldown}s</strong></>
                      ) : (
                        'Did not receive SMS code?'
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={otpCooldown > 0}
                    onClick={() => {
                      setOtpCooldown(24);
                      sendOtp(phone, 'signup');
                      setSuccessNotice('A fresh verification code has been dispatched.');
                    }}
                    className={`font-black transition-colors ${
                      otpCooldown > 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-[#FF6B00] hover:text-[#e05e00] cursor-pointer'
                    }`}
                  >
                    Resend Now
                  </button>
                </div>

                {/* Instant Verification Status Pill */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-black block">Hyperlocal Secure Gate</span>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      Instant session established via SMS verification. No passwords leaked or unencrypted credentials transmitted.
                    </p>
                  </div>
                </div>

                {/* Fast Sandbox Auto-Fill Helper */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Sandbox Demo Code: <strong className="text-slate-800 font-mono">{demoOtpCode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => autoFillOtpCode(demoOtpCode)}
                    className="text-[11px] font-bold text-[#064E3B] hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Confirm & Complete Registration Button */}
                <button
                  type="button"
                  disabled={submitting || !isOtpComplete}
                  onClick={handleCompleteRegistration}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs text-white shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    isOtpComplete && !submitting
                      ? 'bg-[#064E3B] hover:bg-[#033B2D] active:scale-99'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying & Setting Up Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Before Generating OTP: Contextual Dynamic Role Perks & Trust Architecture */
              <>
                {/* Dynamic Role Benefit Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden space-y-4">
                  {/* Decorative background circle */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeRoleData.iconBg}`}>
                        <activeRoleData.headerIcon className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {activeRoleData.headerTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#064E3B]">
                      Member Perks
                    </span>
                  </div>

                  {/* Dynamic Feature List */}
                  <div className="space-y-3">
                    {activeRoleData.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{perk.title}</p>
                          <p className="text-[11px] text-slate-500 leading-snug">{perk.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Network Stats */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Active Network Coverage:</span>
                    <span className="font-black text-[#064E3B]">{activeRoleData.networkStat}</span>
                  </div>
                </div>

                {/* Trust & Security Pillars Bento Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Why Millions Trust ManaMart</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="flex items-center gap-1 text-[#064E3B] font-bold text-[11px]">
                        <Lock className="w-3 h-3" />
                        <span>DigiLocker</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Instant Aadhaar e-KYC without uploading paperwork.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="flex items-center gap-1 text-[#FF6B00] font-bold text-[11px]">
                        <Percent className="w-3 h-3" />
                        <span>Direct UPI</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Real-time instant settlements straight to your bank.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="flex items-center gap-1 text-[#064E3B] font-bold text-[11px]">
                        <Heart className="w-3 h-3" />
                        <span>Mana Ooru</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        100% money stays in your local town economy.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-800 font-bold text-[11px]">
                        <Headphones className="w-3 h-3" />
                        <span>Local Support</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Assistance in Telugu, Hindi, English & regional tongues.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Support & Grievance Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-orange-50 rounded-3xl p-4 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[#064E3B] shadow-2xs">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Need help choosing your role?</p>
                      <p className="text-[11px] text-slate-500">Call merchant desk or WhatsApp us</p>
                    </div>
                  </div>
                  <a
                    href="tel:180062626278"
                    className="px-3.5 py-1.5 bg-white text-[#064E3B] font-extrabold text-xs rounded-xl shadow-2xs hover:bg-slate-50 transition-colors border border-slate-200"
                  >
                    Contact
                  </a>
                </div>
              </>
            )}

          </div>

        </div>

      </main>

      {/* ============================================================== */}
      {/* 3. GLOBAL SHARED FOOTER                                        */}
      {/* ============================================================== */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
            <span className="font-black text-sm text-[#064E3B]">ManaMart</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <p className="text-[11px] text-slate-400">
              © 2025 ManaMart Hyperlocal Technologies Pvt Ltd. Mana Ooru. Mana Market.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
            <Link to="/about" className="hover:text-[#064E3B] transition-colors">About Us</Link>
            <Link to="/register?role=merchant" className="hover:text-[#064E3B] transition-colors">Partner With Us</Link>
            <Link to="/register?role=rider" className="hover:text-[#064E3B] transition-colors">Delivery Fleet</Link>
            <a href="#" className="hover:text-[#064E3B] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#064E3B] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#064E3B] transition-colors">Merchant Grievance</a>
          </nav>
        </div>
      </footer>

    </div>
  );
}
