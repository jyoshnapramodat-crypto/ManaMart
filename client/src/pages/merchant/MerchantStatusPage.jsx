import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Store,
  ArrowRight,
  FileText,
  PhoneCall,
} from 'lucide-react';

export default function MerchantStatusPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants/application-status');
      if (res.data.success) {
        setAppData(res.data);
        if (res.data.status === 'verified') {
          // If approved, update user in local storage so status is active
          if (user) {
            const updated = { ...user, status: 'active', role: 'merchant' };
            setUser(updated);
            localStorage.setItem('manamart_user', JSON.stringify(updated));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching merchant status:', err);
    } finally {
      setLoading(false);
    }
  };

  const status = appData?.status || 'pending_review';
  const application = appData?.application;

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" showTagline={false} to="/" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Merchant Application Status
          </h1>
          <p className="text-xs text-slate-500">
            Real-time verification progress & compliance review
          </p>
        </div>

        {/* Main Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 text-center">
          
          {loading ? (
            <div className="py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Retrieving real-time application audit status...</p>
            </div>
          ) : status === 'verified' || status === 'approved' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Congratulations! Store Verified
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your store <strong>{application?.businessName || 'Your Shop'}</strong> has been audited and approved by the ManaMart Platform Admin. You are now live in your neighborhood!
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/merchant')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Launch Merchant Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : status === 'rejected' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Application Review Remarks
              </h2>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 text-left space-y-1">
                <span className="font-bold">Admin Feedback:</span>
                <p>{application?.rejectionRemarks || 'Please update valid license documentation to comply with regulations.'}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/merchant/apply"
                  className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl transition-all"
                >
                  <span>Re-Submit Documentation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Pending Review */
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Application Under Governance Review</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 pt-1">
                  Verification in Progress
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our compliance team is auditing your business credentials and food/drug safety registrations.
                </p>
              </div>

              {/* Application Details Summary */}
              <div className="bg-[#FCFBF8] rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Business Name</span>
                  <span className="font-bold text-slate-800">{application?.businessName || 'Local Store'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-bold text-slate-800 capitalize">{application?.category || 'Retail'}</span>
                </div>
                {application?.documents?.fssai && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">FSSAI License</span>
                    <span className="font-bold text-emerald-700">{application.documents.fssai}</span>
                  </div>
                )}
                {application?.documents?.drugLicense && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-medium">Drug License</span>
                    <span className="font-bold text-blue-700">{application.documents.drugLicense}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Estimated Turnaround</span>
                  <span className="font-bold text-orange-600">Within 2–4 Hours</span>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="pt-2 flex items-center justify-center space-x-3">
                <button
                  onClick={fetchStatus}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
                  <span>Check Status Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Help Banner */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Merchant Onboarding Desk: 1800-MANAMART</span>
            </span>
            <Link to="/app" className="font-bold text-slate-700 hover:text-orange-600">
              Browse Stores
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

