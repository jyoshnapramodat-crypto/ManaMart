import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPortalLayout from '../../components/admin/AdminPortalLayout';
import {
  Store,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminMerchantsQueueView() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [actionType, setActionType] = useState('approved'); // 'approved' | 'rejected' | 'changes_requested'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/merchants/pending');
      if (res.data?.success) {
        setMerchants(res.data.merchants || []);
      }
    } catch (err) {
      console.error('Error fetching pending merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMerchant) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/admin/merchants/${selectedMerchant.id}/review`, {
        status: actionType,
        remarks: remarks || (actionType === 'approved' ? 'Approved by compliance officer.' : 'Document revision required.'),
      });

      if (res.data?.success) {
        setMerchants((prev) => prev.filter((m) => m.id !== selectedMerchant.id));
        setSelectedMerchant(null);
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
              Merchant Verification & Compliance Queue
            </h1>
            <p className="text-xs text-slate-500">
              Audit submitted FSSAI certifications, trade licenses, and PAN documentation before approving neighborhood listings
            </p>
          </div>

          <button
            onClick={fetchMerchants}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading pending merchant audits...</div>
        ) : merchants.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Verification Queue Clear</p>
            <p>All merchant applications have been audited and resolved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {merchants.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">APP ID: {m.id}</span>
                    <h3 className="font-black text-base text-slate-900">{m.businessName}</h3>
                    <p className="text-xs text-slate-500">Owner: {m.ownerName} • Phone: {m.phone}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 self-start sm:self-center">
                    Pending Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                    <p className="font-bold text-slate-800 capitalize">{m.category || 'Retail'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                    <p className="font-bold text-slate-800">{m.locality || 'Narakoduru'}, {m.city || 'Guntur'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Compliance License</span>
                    <p className="font-mono font-bold text-slate-800">{m.documents?.fssai || m.documents?.drugLicense || 'Submitted'}</p>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Uploaded Regulatory Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {(m.uploadedDocuments && m.uploadedDocuments.length > 0) ? (
                      m.uploadedDocuments.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${api.defaults.baseURL || ''}${doc.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{doc.originalName || doc.docType || 'Document'}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Pre-linked digital credentials</span>
                    )}
                  </div>
                </div>

                {/* Audit Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedMerchant(m);
                      setActionType('changes_requested');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-amber-200 text-amber-800 hover:bg-amber-50 font-bold cursor-pointer"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMerchant(m);
                      setActionType('rejected');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMerchant(m);
                      setActionType('approved');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Approve Store
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedMerchant && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-base text-slate-900">
                Confirm Audit: {actionType.toUpperCase().replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-600">
                Store: <strong>{selectedMerchant.businessName}</strong>
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Auditor Remarks / Instructions for Merchant
                  </label>
                  <textarea
                    rows={3}
                    required={actionType !== 'approved'}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      actionType === 'approved'
                        ? 'All certificates validated. Approved for platform listing.'
                        : 'Please specify the exact document issue (e.g. FSSAI registration scan is blurry or expired)...'
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-purple-600 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMerchant(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-5 py-2 rounded-xl text-white font-bold cursor-pointer disabled:opacity-50 ${
                      actionType === 'approved' ? 'bg-emerald-700 hover:bg-emerald-800' :
                      actionType === 'rejected' ? 'bg-red-700 hover:bg-red-800' :
                      'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    Confirm & Dispatch Decision
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

