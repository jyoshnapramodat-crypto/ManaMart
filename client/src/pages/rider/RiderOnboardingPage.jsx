import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';
import {
  Bike,
  MapPin,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ShieldCheck,
  CreditCard,
  Phone,
} from 'lucide-react';

export default function RiderOnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('Hyderabad');
  const [preferredArea, setPreferredArea] = useState('Madhapur & Hitec City');

  // Step 2: Vehicle
  const [vehicleType, setVehicleType] = useState('motorcycle'); // 'bicycle' | 'ev' | 'motorcycle' | 'scooter'
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Step 3: Driving & Legal
  const [drivingLicense, setDrivingLicense] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  useEffect(() => {
    async function checkStatus() {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('/riders/application-status');
        if (res.data.success && res.data.hasApplied) {
          if (res.data.status === 'verified') {
            navigate('/rider');
          } else {
            navigate('/rider/status');
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
    if (!name.trim() || !phone.trim() || !city.trim() || !preferredArea.trim()) {
      setError('Please fill in all personal information.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    setError(null);
    if (vehicleType !== 'bicycle' && !vehicleNumber.trim()) {
      setError('Please provide your vehicle registration number.');
      return;
    }
    setStep(3);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError(null);

    if (vehicleType !== 'bicycle' && !drivingLicense.trim()) {
      setError('Driving license number is required for motorized delivery vehicles.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        city,
        preferredArea,
        vehicleType,
        vehicleNumber: vehicleNumber || 'Bicycle - No Reg',
        drivingLicense: drivingLicense || 'Bicycle - No DL',
        rcNumber,
        payoutUpi,
        emergencyPhone,
      };

      const res = await api.post('/riders/apply', payload);
      if (res.data.success) {
        if (user) {
          const updatedUser = { ...user, role: 'rider', status: 'pending' };
          setUser(updatedUser);
          localStorage.setItem('manamart_user', JSON.stringify(updatedUser));
        }
        navigate('/rider/status');
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
          <div className="inline-flex items-center space-x-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
            <Bike className="w-3.5 h-3.5 text-orange-600" />
            <span>Rider Partner Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Deliver with ManaMart
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Flexible hours, neighborhood delivery routes, and instant daily payouts
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-bold">
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 1 ? 'bg-orange-50 text-orange-800' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">1</span>
            <span className="truncate">Profile</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 2 ? 'bg-orange-50 text-orange-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className="truncate">Vehicle</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 3 ? 'bg-orange-50 text-orange-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className="truncate">License</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name as on Driving License / Aadhaar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shiva Prasad"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operating City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad, Vijayawada, Warangal"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Delivery Zone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredArea}
                    onChange={(e) => setPreferredArea(e.target.value)}
                    placeholder="e.g. Madhapur / Kukatpally"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Vehicle Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Vehicle Selection */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Vehicle Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'bicycle', label: 'Bicycle', sub: 'No license req.' },
                    { id: 'ev', label: 'EV 2-Wheeler', sub: 'Eco friendly' },
                    { id: 'motorcycle', label: 'Motorcycle', sub: 'Fuel bike' },
                    { id: 'scooter', label: 'Scooter', sub: 'Activa / Jupiter' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        vehicleType === v.id
                          ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Bike className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                      <div className="text-xs font-bold">{v.label}</div>
                      <div className="text-[10px] text-slate-400">{v.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {vehicleType !== 'bicycle' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. TS 09 AB 1234"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase tracking-wider"
                  />
                </div>
              )}

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
                  className="flex-1 bg-gradient-to-r from-[#FF5E1E] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Licensing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Licensing & Verification */}
          {step === 3 && (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              
              {vehicleType !== 'bicycle' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driving License (DL) Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value.toUpperCase())}
                    placeholder="e.g. TS00920220019284"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase tracking-wider"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payout UPI ID (Instant Daily Payouts)
                  </label>
                  <input
                    type="text"
                    value={payoutUpi}
                    onChange={(e) => setPayoutUpi(e.target.value)}
                    placeholder="e.g. rider@okicici"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Family member phone"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* Upload Document Mock Banner */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 text-slate-500 bg-slate-50/50">
                <UploadCloud className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-slate-700">Driving License & RC Photo Attached</span>
                <span className="text-[10px] text-slate-400">Pre-linked for platform background check</span>
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
                      <span>Submit Rider Application</span>
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

