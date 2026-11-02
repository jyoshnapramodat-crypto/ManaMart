import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';
import DocumentUploadInput from '../../components/DocumentUploadInput';
import {
  Store,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  CreditCard,
  FileCheck2,
} from 'lucide-react';

export default function MerchantOnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Store Basics
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('food');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Step 2: Location & Timings
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('Narakoduru');
  const [city, setCity] = useState('Guntur District');
  const [pincode, setPincode] = useState('522212');
  const [openTime, setOpenTime] = useState('08:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');

  // Step 3: Regulatory & Documents
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [drugLicense, setDrugLicense] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');

  // Uploaded Document States
  const [ownerIdDoc, setOwnerIdDoc] = useState(null);
  const [tradeLicenseDoc, setTradeLicenseDoc] = useState(null);
  const [panDoc, setPanDoc] = useState(null);
  const [bankProofDoc, setBankProofDoc] = useState(null);
  const [fssaiDoc, setFssaiDoc] = useState(null);
  const [drugLicenseDoc, setDrugLicenseDoc] = useState(null);

  // Check existing application status on load
  useEffect(() => {
    async function checkStatus() {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('/merchants/application-status');
        if (res.data.success && res.data.hasApplied) {
          if (res.data.status === 'verified' || res.data.status === 'approved') {
            navigate('/merchant');
          } else {
            navigate('/merchant/status');
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
    if (category === 'food') {
      if (!fssaiLicense.trim()) {
        setError('FSSAI 14-digit registration number is mandatory for all food businesses.');
        return;
      }
      if (!fssaiDoc) {
        setError('Please upload your FSSAI certificate document scan or PDF.');
        return;
      }
    }

    // Pharmacy category validation
    if (category === 'pharmacy') {
      if (!drugLicense.trim()) {
        setError('Drug license registration number is mandatory for pharmacies.');
        return;
      }
      if (!drugLicenseDoc) {
        setError('Please upload your Drug Controller license document scan or PDF.');
        return;
      }
    }

    // Baseline required docs
    if (!ownerIdDoc) {
      setError('Please upload the shop owner Govt ID proof (Aadhaar / Voter ID / Passport).');
      return;
    }
    if (!tradeLicenseDoc) {
      setError('Please upload your Trade License / Shop & Establishment document.');
      return;
    }

    setLoading(true);
    try {
      const documents = [];
      if (ownerIdDoc) documents.push(ownerIdDoc);
      if (tradeLicenseDoc) documents.push(tradeLicenseDoc);
      if (panDoc) documents.push(panDoc);
      if (bankProofDoc) documents.push(bankProofDoc);
      if (fssaiDoc) documents.push(fssaiDoc);
      if (drugLicenseDoc) documents.push(drugLicenseDoc);

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
        documents,
      };

      const res = await api.post('/merchants/apply', payload);
      if (res.data.success) {
        if (user) {
          const updatedUser = { ...user, role: 'merchant', status: 'pending_verification' };
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
    <div className="min-h-screen bg-[#FFF8ED] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" showTagline={false} to="/" />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-[#E8F3EC] text-[#064E3B] px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <Store className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Merchant Onboarding & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register Your Neighborhood Store
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Join hundreds of local dukans, restaurants, and pharmacies serving your neighborhood
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-bold">
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 1 ? 'bg-[#E8F3EC] text-[#064E3B]' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-[#064E3B] text-white flex items-center justify-center text-xs">1</span>
            <span className="truncate">Store Info</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 2 ? 'bg-[#E8F3EC] text-[#064E3B]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#064E3B] text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className="truncate">Location</span>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-xl ${step === 3 ? 'bg-[#E8F3EC] text-[#064E3B]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#064E3B] text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className="truncate">Compliance Docs</span>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] focus:ring-4 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] focus:ring-4 focus:ring-emerald-100 outline-none bg-white"
                >
                  <option value="food">Food & Restaurant (Requires FSSAI & Certificate)</option>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
                  placeholder="Shop No. 4, Main Road"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none"
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
                    placeholder="e.g. Narakoduru"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Guntur District"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none"
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
                    placeholder="522212"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none"
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
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold text-sm py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Continue to Compliance & Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Regulatory Compliance & Genuine Document Uploads */}
          {step === 3 && (
            <form onSubmit={handleSubmitApplication} className="space-y-5">
              
              {/* Category-Specific Regulatory Warning */}
              {category === 'food' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Under Food Safety & Standards Regulations (FSSAI), all food businesses must register a valid 14-digit FSSAI license and upload the certificate for administrative verification.
                  </span>
                </div>
              )}

              {category === 'pharmacy' && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 text-xs font-semibold flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Pharmacies require state drug controller license certification (Form 20/21) prior to dispensing prescription medications.
                  </span>
                </div>
              )}

              {/* FSSAI Registration */}
              {category === 'food' && (
                <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      FSSAI Registration / License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={fssaiLicense}
                      onChange={(e) => setFssaiLicense(e.target.value.replace(/\D/g, ''))}
                      placeholder="14-digit FSSAI number e.g. 13621014000452"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none tracking-wider bg-white"
                    />
                  </div>
                  <DocumentUploadInput
                    label="FSSAI Certificate Document"
                    description="Upload clear photo or PDF copy of your 14-digit FSSAI registration certificate"
                    docType="fssai_certificate"
                    required
                    value={fssaiDoc}
                    onChange={setFssaiDoc}
                  />
                </div>
              )}

              {/* Drug License */}
              {category === 'pharmacy' && (
                <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Drug License Number (Form 20/21) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={drugLicense}
                      onChange={(e) => setDrugLicense(e.target.value)}
                      placeholder="e.g. DL-AP-2024-9842"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B] outline-none bg-white"
                    />
                  </div>
                  <DocumentUploadInput
                    label="Drug Controller License Certificate"
                    description="Upload valid pharmacy license certificate issued by state drug authority"
                    docType="drug_license"
                    required
                    value={drugLicenseDoc}
                    onChange={setDrugLicenseDoc}
                  />
                </div>
              )}

              {/* Business Identification & Tax */}
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase focus:border-[#064E3B]"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium uppercase focus:border-[#064E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement UPI ID / Bank Payout
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payoutUpi}
                    onChange={(e) => setPayoutUpi(e.target.value)}
                    placeholder="e.g. shopowner@okhdfcbank"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[#064E3B]"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Mandatory Document Uploads */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#064E3B]" />
                  <span>Required Regulatory Documents</span>
                </h3>

                <DocumentUploadInput
                  label="Owner Identity Proof"
                  description="Aadhaar Card, Passport, or Voter ID of the store proprietor"
                  docType="owner_id"
                  required
                  value={ownerIdDoc}
                  onChange={setOwnerIdDoc}
                />

                <DocumentUploadInput
                  label="Trade License / Shop Establishment Proof"
                  description="Municipal trade license, Gram Panchayat registration, or shop certificate"
                  docType="trade_license"
                  required
                  value={tradeLicenseDoc}
                  onChange={setTradeLicenseDoc}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentUploadInput
                    label="PAN Card Document"
                    description="PAN card scan of proprietor / entity"
                    docType="pan_card"
                    value={panDoc}
                    onChange={setPanDoc}
                  />

                  <DocumentUploadInput
                    label="Bank Account Proof"
                    description="Cancelled cheque or passbook first page"
                    docType="bank_proof"
                    value={bankProofDoc}
                    onChange={setBankProofDoc}
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
                      <span>Submit for Admin Audit & Verification</span>
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
