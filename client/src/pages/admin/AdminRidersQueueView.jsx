import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPortalLayout from '../../components/admin/AdminPortalLayout';
import {
  Bike,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function AdminRidersQueueView() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedRider, setSelectedRider] = useState(null);
  const [actionType, setActionType] = useState('approved');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/riders/pending');
      if (res.data?.success) {
        setRiders(res.data.riders || []);
      }
    } catch (err) {
      console.error('Error fetching pending riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRider) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/admin/riders/${selectedRider.id}/review`, {
        status: actionType,
        remarks: remarks || (actionType === 'approved' ? 'Driving credentials approved.' : 'Please update license documents.'),
      });

      if (res.data?.success) {
        setRiders((prev) => prev.filter((r) => r.id !== selectedRider.id));
        setSelectedRider(null);
        setRemarks('');
      } else {
        alert(res.data?.message || 'Review failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Delivery Hero Driving Credentials Audit
            </h1>
            <p className="text-xs text-slate-500">
              Verify driving licenses, vehicle RC documents, and criminal background checks prior to courier onboarding
            </p>
          </div>

          <button
            onClick={fetchRiders}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading pending rider audits...</div>
        ) : riders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Rider Queue Clear</p>
            <p>All delivery partner applications have been audited.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {riders.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">APP ID: {r.id}</span>
                    <h3 className="font-black text-base text-slate-900">{r.name}</h3>
                    <p className="text-xs text-slate-500">Phone: {r.phone} • City: {r.city || 'Guntur District'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-[#FF6B00] self-start sm:self-center">
                    Awaiting License Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle</span>
                    <p className="font-bold text-slate-800 uppercase">{r.vehicleType || 'Motorcycle'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Driving License</span>
                    <p className="font-mono font-bold text-slate-800">{r.drivingLicense || 'Submitted'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Zone</span>
                    <p className="font-bold text-slate-800">{r.preferredArea || 'Narakoduru Zone'}</p>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Uploaded Driving Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {(r.uploadedDocuments && r.uploadedDocuments.length > 0) ? (
                      r.uploadedDocuments.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${api.defaults.baseURL || ''}${doc.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-200 text-xs font-bold transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{doc.originalName || doc.docType || 'DL/RC Document'}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Digital driving license record</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedRider(r);
                      setActionType('changes_requested');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-amber-200 text-amber-800 hover:bg-amber-50 font-bold cursor-pointer"
                  >
                    Request License Re-upload
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRider(r);
                      setActionType('rejected');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRider(r);
                      setActionType('approved');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Approve to Ride
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedRider && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-base text-slate-900">
                Confirm Rider Audit: {actionType.toUpperCase().replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-600">Partner: <strong>{selectedRider.name}</strong></p>

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Remarks for Delivery Partner</label>
                  <textarea
                    rows={3}
                    required={actionType !== 'approved'}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      actionType === 'approved'
                        ? 'Driving license and vehicle RC approved.'
                        : 'Explain reason for document rejection or re-upload...'
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-purple-600 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRider(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    Submit Audit Result
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPortalLayout>
  );
}

