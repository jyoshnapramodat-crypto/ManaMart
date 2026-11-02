import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';
import DocumentUploadInput from '../../components/DocumentUploadInput';
import {
  Bike,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  FileCheck2,
} from 'lucide-react';

export default function RiderOnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Personal Details
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('Guntur District');
  const [preferredArea, setPreferredArea] = useState('Narakoduru & Chebrolu Zone');

  // Step 2: Vehicle
  const [vehicleType, setVehicleType] = useState('motorcycle'); // 'bicycle' | 'ev' | 'motorcycle' | 'scooter'
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Step 3: Licensing & Verification
  const [drivingLicense, setDrivingLicense] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Uploaded Document States
  const [drivingLicenseDoc, setDrivingLicenseDoc] = useState(null);
  const [rcDoc, setRcDoc] = useState(null);
  const [govtIdDoc, setGovtIdDoc] = useState(null);
  const [profilePhotoDoc, setProfilePhotoDoc] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('/riders/application-status');
        if (res.data.success && res.data.hasApplied) {
          if (res.data.status === 'verified' || res.data.status === 'approved') {
            navigate('/rider');
          } else {
            navigate('/rider/status');
          }
        }
      } catch (err) {
        // Ok if not yet applied
      }
    }
    checkStatus();
  }, [isLoggedIn, navigate]);

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

    if (vehicleType !== 'bicycle') {
      if (!drivingLicense.trim()) {
        setError('Driving license number is required for motorized delivery vehicles.');
        return;
      }
      if (!drivingLicenseDoc) {
        setError('Please upload a clear photo or scan of your driving license.');
        return;
      }
      if (!rcDoc) {
        setError('Please upload your vehicle RC registration document scan.');
        return;
      }
    }

    if (!govtIdDoc) {
      setError('Please upload your Govt ID proof (Aadhaar / Voter ID).');
      return;
    }

    setLoading(true);
    try {
      const documents = [];
      if (drivingLicenseDoc) documents.push(drivingLicenseDoc);
      if (rcDoc) documents.push(rcDoc);
      if (govtIdDoc) documents.push(govtIdDoc);
      if (profilePhotoDoc) documents.push(profilePhotoDoc);

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
        documents,
      };

      const res = await api.post('/riders/apply', payload);
      if (res.data.success) {
        if (user) {
          const updatedUser = { ...user, role: 'rider', status: 'pending_verification' };
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
    <div className="min-h-screen bg-[#FFF8ED] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" showTagline={false} to="/" />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-[#FFF0E3] text-[#FF6B00] px-3.5 py-1 rounded-full text-xs font-bold border border-orange-200">
            <Bike className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Delivery Partner Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Deliver with ManaMart
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Flexible neighborhood deliveries, fair order payouts, and instant earnings
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-bold">
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 1 ? 'bg-[#FFF0E3] text-[#FF6B00]' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs">1</span>
            <span className="truncate">Partner Profile</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 2 ? 'bg-[#FFF0E3] text-[#FF6B00]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#FF6B00] text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className="truncate">Vehicle Info</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 3 ? 'bg-[#FFF0E3] text-[#FF6B00]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#FF6B00] text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className="truncate">License & Docs</span>
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
                  Full Legal Name (as on Driving License / Aadhaar) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shiva Prasad"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#FF6B00] outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#FF6B00] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operating City / District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Guntur District"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#FF6B00] outline-none"
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
                    placeholder="e.g. Narakoduru / Tenali Road"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#FF6B00] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
                    { id: 'bicycle', label: 'Bicycle', sub: 'Zero fuel cost' },
                    { id: 'ev', label: 'EV 2-Wheeler', sub: 'Eco electric' },
                    { id: 'motorcycle', label: 'Motorcycle', sub: 'Fuel bike' },
                    { id: 'scooter', label: 'Scooter', sub: 'Activa / Jupiter' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        vehicleType === v.id
                          ? 'border-[#FF6B00] bg-orange-50 text-orange-950 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Bike className="w-5 h-5 mx-auto mb-1 text-[#FF6B00]" />
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
                    placeholder="e.g. AP 07 CD 5678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase tracking-wider focus:border-[#FF6B00]"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Continue to Licensing & Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Licensing & Document Verification */}
          {step === 3 && (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              
              {vehicleType !== 'bicycle' && (
                <div className="space-y-3 p-4 rounded-2xl bg-orange-50/40 border border-orange-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Driving License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={drivingLicense}
                        onChange={(e) => setDrivingLicense(e.target.value.toUpperCase())}
                        placeholder="e.g. AP00720220019284"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium uppercase tracking-wider bg-white focus:border-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        RC Book Number
                      </label>
                      <input
                        type="text"
                        value={rcNumber}
                        onChange={(e) => setRcNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. AP07CD5678"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium uppercase tracking-wider bg-white focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <DocumentUploadInput
                      label="Driving License Document"
                      description="Clear front photo or PDF of your valid driving license"
                      docType="driving_license"
                      required
                      value={drivingLicenseDoc}
                      onChange={setDrivingLicenseDoc}
                    />

                    <DocumentUploadInput
                      label="Vehicle Registration (RC)"
                      description="Clear photo or PDF of vehicle registration certificate"
                      docType="rc_book"
                      required
                      value={rcDoc}
                      onChange={setRcDoc}
                    />
                  </div>
                </div>
              )}

              {/* Personal Identification Proofs */}
              <div className="space-y-3 pt-2">
                <DocumentUploadInput
                  label="Govt ID Proof (Aadhaar / Voter ID)"
                  description="Clear photo or scan of your Aadhaar card or Govt identification"
                  docType="govt_id"
                  required
                  value={govtIdDoc}
                  onChange={setGovtIdDoc}
                />

                <DocumentUploadInput
                  label="Rider Profile Photo (Selfie)"
                  description="Recent front-facing photo for your delivery profile badge"
                  docType="profile_photo"
                  value={profilePhotoDoc}
                  onChange={setProfilePhotoDoc}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payout UPI ID (Instant Daily Payouts)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={payoutUpi}
                      onChange={(e) => setPayoutUpi(e.target.value)}
                      placeholder="e.g. rider@okicici"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#FF6B00]"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Rider Application for Audit</span>
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
