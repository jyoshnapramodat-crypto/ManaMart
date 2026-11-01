import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';
import {
  Store,
  MapPin,
  FileCheck2,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ShieldCheck,
  Building2,
  CreditCard,
} from 'lucide-react';

export default function MerchantOnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('food');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Step 2
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('Madhapur');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('500081');
  const [openTime, setOpenTime] = useState('08:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');

  // Step 3: Regulatory
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [drugLicense, setDrugLicense] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');

  // Check if merchant has already submitted an application
  useEffect(() => {
    async function checkStatus() {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('/merchants/application-status');
        if (res.data.success && res.data.hasApplied) {
          if (res.data.status === 'verified') {
            navigate('/merchant');
          } else {
            navigate('/merchant/status');
          }
        }
      } catch (err) {
        // ok if no application yet
      }
    }
    checkStatus();
  }, [isLoggedIn]);

  const handleNextStep1 = (e) => {
    e.preventDefault();
    setError(null);
    if (!businessName.trim()) {
      setError('Please enter your business or shop name.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    setError(null);
    if (!street.trim() || !locality.trim() || !city.trim()) {
      setError('Please provide the physical shop address details.');
      return;
    }
    setStep(3);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError(null);

    // Food category validation
    if (category === 'food' && !fssaiLicense.trim()) {
      setError('FSSAI 14-digit registration number is mandatory for all food businesses.');
      return;
    }

    // Pharmacy category validation
    if (category === 'pharmacy' && !drugLicense.trim()) {
      setError('Drug license registration number is mandatory for pharmacies.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        businessName,
        category,
        ownerName,
        phone,
        email,
        street,
        locality,
        city,
        pincode,
        openTime,
        closeTime,
        fssaiLicense,
        drugLicense,
        panNumber,
        gstin,
        payoutUpi,
      };

      const res = await api.post('/merchants/apply', payload);
      if (res.data.success) {
        // Update user state to reflect merchant pending role
        if (user) {
          const updatedUser = { ...user, role: 'merchant', status: 'pending' };
          setUser(updatedUser);
          localStorage.setItem('manamart_user', JSON.stringify(updatedUser));
        }
        navigate('/merchant/status');
      } else {
        setError(res.data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while submitting application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" showTagline={false} to="/" />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Merchant Onboarding & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register Your Neighborhood Store
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Join hundreds of local dukans, restaurants, and pharmacies serving your neighborhood
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-bold">
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 1 ? 'bg-emerald-50 text-emerald-800' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
            <span className="truncate">Store Info</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 2 ? 'bg-emerald-50 text-emerald-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className="truncate">Location</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 3 ? 'bg-emerald-50 text-emerald-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className="truncate">Compliance</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Store Basics */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Swagath Grand Family Restaurant or Sri Balaji Kirana"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none bg-white"
                >
                  <option value="food">Food & Restaurant (Requires FSSAI)</option>
                  <option value="grocery">Kirana & Supermarket</option>
                  <option value="pharmacy">Pharmacy & Healthcare (Requires Drug License)</option>
                  <option value="bakery">Bakery & Sweets</option>
                  <option value="flowers">Flowers, Pooja & Gifts</option>
                  <option value="electronics">Electronics & Local Services</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Owner's Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Shop phone"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Store Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Location & Timings */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street & Building Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Shop No. 4, Main Bazaar Road"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Locality / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Madhapur"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="500081"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    placeholder="10:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Compliance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Regulatory Compliance */}
          {step === 3 && (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              
              {/* Category-Specific Regulatory Warning */}
              {category === 'food' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Under Food Safety & Standards Regulations, all restaurants, cloud kitchens, and food shops must register a valid 14-digit FSSAI license.
                  </span>
                </div>
              )}

              {category === 'pharmacy' && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-800 text-xs font-semibold flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Pharmacies require state drug controller license certification before dispensing prescription medications.
                  </span>
                </div>
              )}

              {/* FSSAI */}
              {category === 'food' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    FSSAI Registration / License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value.replace(/\D/g, ''))}
                    placeholder="14-digit FSSAI number e.g. 13621014000452"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none tracking-wider"
                  />
                </div>
              )}

              {/* Drug License */}
              {category === 'pharmacy' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Drug License Number (Form 20/21) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={drugLicense}
                    onChange={(e) => setDrugLicense(e.target.value)}
                    placeholder="e.g. DL-HYD-2024-9842"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GSTIN Number (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="36AAAAA0000A1Z5"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement UPI ID / Bank Account
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payoutUpi}
                    onChange={(e) => setPayoutUpi(e.target.value)}
                    placeholder="e.g. shopowner@okhdfcbank"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Upload Document Mock Trigger */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 text-slate-500 bg-slate-50/50">
                <UploadCloud className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Digital Certificate Scans Attached</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB (Pre-linked for verification)</span>
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit for Admin Audit</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

