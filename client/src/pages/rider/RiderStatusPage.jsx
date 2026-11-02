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
  RefreshCw,
  Bike,
  ArrowRight,
  PhoneCall,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';

export default function RiderStatusPage() {
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
      const res = await api.get('/riders/application-status');
      if (res.data.success) {
        setAppData(res.data);
        if (res.data.status === 'verified' || res.data.status === 'approved') {
          if (user) {
            const updated = { ...user, status: 'active', role: 'rider' };
            setUser(updated);
            localStorage.setItem('manamart_user', JSON.stringify(updated));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching rider status:', err);
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
      const res = await api.post('/riders/resubmit', {
        documents: docList,
        remarks: resubmitRemarks,
      });

      if (res.data.success) {
        setShowResubmit(false);
        fetchStatus();
      } else {
        setResubmitError(res.data.message || 'Failed to resubmit rider application.');
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
            Rider Verification Status
          </h1>
          <p className="text-xs text-slate-600">
            Driving license audit & neighborhood courier approval lifecycle
          </p>
        </div>

        {/* Main Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 text-center">
          
          {loading ? (
            <div className="py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Auditing rider verification status...</p>
            </div>
          ) : status === 'verified' || status === 'approved' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                You Are Approved to Ride!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Congratulations {application?.name || 'Partner'}! Your driving credentials and vehicle have been approved. You can now toggle online and start delivering in your neighborhood.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/rider')}
                  className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Bike className="w-4 h-4" />
                  <span>Open Delivery Partner Console</span>
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
                  {status === 'changes_requested' ? 'License Document Updates Needed' : 'Application Review Remarks'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please review the reviewer remarks and upload an updated document scan.
                </p>
              </div>

              {/* Admin Feedback Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">Admin Feedback:</span>
                <p className="font-medium text-slate-800">
                  {application?.rejectionRemarks || 'Please upload a clear, legible photograph of your Driving License and Vehicle RC.'}
                </p>
              </div>

              {/* Resubmit form */}
              {!showResubmit ? (
                <div className="pt-2">
                  <button
                    onClick={() => setShowResubmit(true)}
                    className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Corrected Credentials & Resubmit</span>
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
                    label="Updated Driving License / RC Document"
                    description="Upload clear photo or PDF resolving the reviewer remark"
                    docType="corrected_license"
                    required
                    value={resubmitDocs.primary}
                    onChange={(doc) => setResubmitDocs((prev) => ({ ...prev, primary: doc }))}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes for Platform Auditor
                    </label>
                    <textarea
                      rows={2}
                      value={resubmitRemarks}
                      onChange={(e) => setResubmitRemarks(e.target.value)}
                      placeholder="e.g. Attached the renewed Driving License copy..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#FF6B00] outline-none"
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
                          <span>Submit Revision</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Pending Review */
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#FF6B00] flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-900 text-xs font-bold border border-orange-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>
                    {status === 'under_review' ? 'License Under Active Review' : 'Rider Background Check in Progress'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 pt-1">
                  License Verification Underway
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  ManaMart Admin is validating your driving license and vehicle registration.
                </p>
              </div>

              {/* Rider Summary */}
              <div className="bg-[#FFF8ED]/60 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Partner Name</span>
                  <span className="font-bold text-slate-800">{application?.name || 'Rider Partner'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Vehicle</span>
                  <span className="font-bold text-slate-800 uppercase">{application?.vehicleType} ({application?.vehicleNumber})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Preferred Zone</span>
                  <span className="font-bold text-slate-800">{application?.preferredArea || 'Local Zone'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Verification SLA</span>
                  <span className="font-bold text-emerald-800">Typically Approved in ~1–2 Hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center space-x-3">
                <button
                  onClick={fetchStatus}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Rider Helpdesk: 1800-MANAMART</span>
            </span>
            <Link to="/app" className="font-bold text-slate-700 hover:text-[#FF6B00]">
              Go to Marketplace
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
