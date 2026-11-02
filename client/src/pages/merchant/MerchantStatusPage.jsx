import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../../components/Logo';
import DocumentUploadInput from '../../components/DocumentUploadInput';
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
  ExternalLink,
  UploadCloud,
} from 'lucide-react';

export default function MerchantStatusPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resubmission State
  const [showResubmit, setShowResubmit] = useState(false);
  const [resubmitDocs, setResubmitDocs] = useState({});
  const [resubmitRemarks, setResubmitRemarks] = useState('');
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants/application-status');
      if (res.data.success) {
        setAppData(res.data);
        if (res.data.status === 'approved' || res.data.status === 'verified') {
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

  const status = appData?.status || 'pending_verification';
  const application = appData?.application;

  const handleResubmit = async (e) => {
    e.preventDefault();
    setResubmitError(null);

    const docList = Object.values(resubmitDocs).filter(Boolean);
    if (docList.length === 0) {
      setResubmitError('Please upload at least one corrected or updated document.');
      return;
    }

    setResubmitting(true);
    try {
      const res = await api.post('/merchants/resubmit', {
        documents: docList,
        remarks: resubmitRemarks,
      });

      if (res.data.success) {
        setShowResubmit(false);
        fetchStatus();
      } else {
        setResubmitError(res.data.message || 'Failed to resubmit application.');
      }
    } catch (err) {
      setResubmitError(err.response?.data?.message || 'Server error during resubmission.');
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" showTagline={false} to="/" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Merchant Application Status
          </h1>
          <p className="text-xs text-slate-600">
            Real-time compliance audit & administrative governance lifecycle
          </p>
        </div>

        {/* Main Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 text-center">
          
          {loading ? (
            <div className="py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-[#064E3B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Retrieving real-time application audit status...</p>
            </div>
          ) : status === 'approved' || status === 'verified' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Congratulations! Store Verified
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your store <strong>{application?.businessName || 'Your Shop'}</strong> has been audited and approved by the ManaMart Platform Admin. Your dukaan is now live for neighbors!
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/merchant')}
                  className="w-full bg-[#064E3B] hover:bg-[#033B2D] text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Launch Merchant Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : status === 'changes_requested' || status === 'rejected' ? (
            <div className="space-y-4 text-left">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
                  status === 'changes_requested' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                }`}>
                  {status === 'changes_requested' ? <AlertCircle className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-3">
                  {status === 'changes_requested' ? 'Modifications Requested by Admin' : 'Application Review Remarks'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {status === 'changes_requested'
                    ? 'Please review the administrative remarks below and upload updated documentation.'
                    : 'The application was not approved with the current documents.'}
                </p>
              </div>

              {/* Admin Feedback Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">Administrator Remarks:</span>
                <p className="font-medium text-slate-800">
                  {application?.rejectionRemarks || 'Please update your compliance certificate with a legible and unexpired copy.'}
                </p>
              </div>

              {/* Resubmission Section */}
              {!showResubmit ? (
                <div className="pt-2">
                  <button
                    onClick={() => setShowResubmit(true)}
                    className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Corrected Documents & Resubmit</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResubmit} className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-900">Upload Corrected Documents</h3>

                  {resubmitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                      {resubmitError}
                    </div>
                  )}

                  <DocumentUploadInput
                    label="Updated Primary Document (FSSAI / Trade License / ID)"
                    description="Upload legible scan or PDF addressing the admin remarks"
                    docType="corrected_document"
                    required
                    value={resubmitDocs.primary}
                    onChange={(doc) => setResubmitDocs((prev) => ({ ...prev, primary: doc }))}
                  />

                  <DocumentUploadInput
                    label="Optional Supporting Document (if requested)"
                    description="Additional registration certificate or tax proof"
                    docType="supporting_document"
                    value={resubmitDocs.secondary}
                    onChange={(doc) => setResubmitDocs((prev) => ({ ...prev, secondary: doc }))}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Response / Notes for Compliance Officer
                    </label>
                    <textarea
                      rows={2}
                      value={resubmitRemarks}
                      onChange={(e) => setResubmitRemarks(e.target.value)}
                      placeholder="e.g. Attached the renewed 2026 FSSAI license copy and verified GSTIN..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#064E3B] outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResubmit(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resubmitting}
                      className="flex-1 bg-[#064E3B] hover:bg-[#033B2D] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {resubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Revision for Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Pending Review / Under Review */
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {status === 'under_review' ? 'Application Under Active Review' : 'Pending Administrative Audit'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 pt-1">
                  Verification in Progress
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Our compliance team is auditing your business credentials and food/drug safety registrations.
                </p>
              </div>

              {/* Application Details Summary */}
              <div className="bg-[#FFF8ED]/60 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2.5">
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
                    <span className="font-bold text-emerald-800">{application.documents.fssai}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Uploaded Files</span>
                  <span className="font-bold text-slate-800">
                    {application?.uploadedDocuments?.length || 0} Documents Attached
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Estimated Turnaround</span>
                  <span className="font-bold text-[#FF6B00]">Within 2–4 Hours</span>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="pt-2 flex items-center justify-center space-x-3">
                <button
                  onClick={fetchStatus}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Check Status Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Help Banner */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Merchant Onboarding Desk: 1800-MANAMART</span>
            </span>
            <Link to="/app" className="font-bold text-slate-700 hover:text-[#FF6B00]">
              Browse Stores
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
