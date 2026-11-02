import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPortalLayout from '../../components/admin/AdminPortalLayout';
import {
  ShieldCheck,
  Store,
  Bike,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  Stamp,
  Eye,
} from 'lucide-react';

export default function AdminVerificationsView() {
  const [merchants, setMerchants] = useState([]);
  const [riders, setRiders] = useState([]);
  const [tab, setTab] = useState('all'); // 'all' | 'merchants' | 'riders'
  const [loading, setLoading] = useState(true);

  // Document Inspection Modal State
  const [inspectDoc, setInspectDoc] = useState(null); // { entityType: 'merchant'|'rider', entity: Object, doc: Object }
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Verification Decision State
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [successStamp, setSuccessStamp] = useState(null);

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const [merchRes, ridersRes] = await Promise.all([
        api.get('/admin/merchants/pending'),
        api.get('/admin/riders/pending'),
      ]);

      if (merchRes.data?.success) setMerchants(merchRes.data.merchants || []);
      if (ridersRes.data?.success) setRiders(ridersRes.data.riders || []);
    } catch (err) {
      console.error('Error fetching verification queues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocInspection = (entityType, entity, doc) => {
    setInspectDoc({ entityType, entity, doc });
    setZoomLevel(1);
    setRotation(0);
    setShowRejectPrompt(false);
    setRejectionReason('');
    setSuccessStamp(null);
  };

  const handleCloseModal = () => {
    setInspectDoc(null);
    setZoomLevel(1);
    setRotation(0);
    setShowRejectPrompt(false);
    setRejectionReason('');
    setSuccessStamp(null);
  };

  // Immediate Approval Stamp
  const handleStampApprove = async () => {
    if (!inspectDoc) return;
    const { entityType, entity } = inspectDoc;
    setActionInProgress(true);

    try {
      const endpoint =
        entityType === 'merchant'
          ? `/admin/merchants/${entity.id || entity.applicationId}/verify`
          : `/admin/riders/${entity.id || entity.applicationId}/verify`;

      const res = await api.post(endpoint, {
        action: 'approve',
        status: 'approved',
        remarks: 'All documents verified and compliant under platform regulations. Status set to APPROVED.',
      });

      if (res.data?.success) {
        setSuccessStamp('APPROVED');
        setTimeout(() => {
          if (entityType === 'merchant') {
            setMerchants((prev) => prev.filter((m) => (m.id || m.applicationId) !== (entity.id || entity.applicationId)));
          } else {
            setRiders((prev) => prev.filter((r) => (r.id || r.applicationId) !== (entity.id || entity.applicationId)));
          }
          handleCloseModal();
        }, 1200);
      } else {
        alert(res.data?.message || 'Approval action failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing approval stamp');
    } finally {
      setActionInProgress(false);
    }
  };

  // Reject with Reason
  const handleStampReject = async (e) => {
    e?.preventDefault();
    if (!inspectDoc || !rejectionReason.trim()) return;
    const { entityType, entity } = inspectDoc;
    setActionInProgress(true);

    try {
      const endpoint =
        entityType === 'merchant'
          ? `/admin/merchants/${entity.id || entity.applicationId}/verify`
          : `/admin/riders/${entity.id || entity.applicationId}/verify`;

      const res = await api.post(endpoint, {
        action: 'reject',
        status: 'rejected',
        remarks: rejectionReason.trim(),
        rejectionReason: rejectionReason.trim(),
      });

      if (res.data?.success) {
        setSuccessStamp('REJECTED');
        setTimeout(() => {
          if (entityType === 'merchant') {
            setMerchants((prev) => prev.filter((m) => (m.id || m.applicationId) !== (entity.id || entity.applicationId)));
          } else {
            setRiders((prev) => prev.filter((r) => (r.id || r.applicationId) !== (entity.id || entity.applicationId)));
          }
          handleCloseModal();
        }, 1200);
      } else {
        alert(res.data?.message || 'Rejection action failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing rejection stamp');
    } finally {
      setActionInProgress(false);
    }
  };

  // Zoom Controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const totalCount = merchants.length + riders.length;

  return (
    <AdminPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-700" />
              <span>Verification Queues & Document Inspection</span>
            </h1>
            <p className="text-xs text-slate-500">
              In-line forensic audit of FSSAI food certificates, trade licenses, and driving credentials with quick verification stamps
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchQueues}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
              <span>Refresh ({totalCount})</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Pending ({totalCount})
          </button>
          <button
            onClick={() => setTab('merchants')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              tab === 'merchants'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Store FSSAI & Licenses ({merchants.length})
          </button>
          <button
            onClick={() => setTab('riders')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              tab === 'riders'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rider Driving Licenses ({riders.length})
          </button>
        </div>

        {/* Queue Cards */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : totalCount === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">All Queues Completely Audited</p>
            <p className="text-[11px] text-slate-400 mt-1">Zero pending merchant or rider compliance documents.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Merchant Entries */}
            {(tab === 'all' || tab === 'merchants') &&
              merchants.map((m) => (
                <div
                  key={`m-${m.id || m.applicationId}`}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#064E3B] flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-sm text-slate-900">{m.businessName}</h3>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                            {m.category || 'Food'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Proprietor: {m.ownerName} • Phone: {m.phone} • {m.locality || 'Narakoduru'}, {m.city || 'Guntur'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-center">
                      Awaiting FSSAI / Trade Audit
                    </span>
                  </div>

                  {/* Documents Row with Quick Inspect Buttons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700">Submitted Compliance Certificates:</span>
                    <div className="flex flex-wrap gap-2">
                      {m.uploadedDocuments && m.uploadedDocuments.length > 0 ? (
                        m.uploadedDocuments.map((doc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleOpenDocInspection('merchant', m, doc)}
                            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span>{doc.originalName || doc.docType || `Document #${idx + 1}`}</span>
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDocInspection('merchant', m, {
                              originalName: `${m.category || 'Food'} License Certificate`,
                              fileUrl: '/logo.png',
                              docType: 'fssai_certificate',
                            })
                          }
                          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>FSSAI Registration #{m.documents?.fssai || '13621014000452'}</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* Rider Entries */}
            {(tab === 'all' || tab === 'riders') &&
              riders.map((r) => (
                <div
                  key={`r-${r.id || r.applicationId}`}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-sm text-slate-900">{r.name}</h3>
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md uppercase">
                            {r.vehicleType || 'Motorcycle'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Phone: {r.phone} • DL: {r.drivingLicense || 'AP00720220019284'} • Zone: {r.preferredArea || 'Narakoduru'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-orange-50 text-orange-800 border border-orange-200 self-start sm:self-center">
                      Awaiting DL / RC Audit
                    </span>
                  </div>

                  {/* Documents Row */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700">Submitted Driving Credentials:</span>
                    <div className="flex flex-wrap gap-2">
                      {r.uploadedDocuments && r.uploadedDocuments.length > 0 ? (
                        r.uploadedDocuments.map((doc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleOpenDocInspection('rider', r, doc)}
                            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <FileText className="w-4 h-4 text-orange-600" />
                            <span>{doc.originalName || doc.docType || `Document #${idx + 1}`}</span>
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDocInspection('rider', r, {
                              originalName: 'Driving License Front Scan',
                              fileUrl: '/logo.png',
                              docType: 'driving_license',
                            })
                          }
                          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span>Driving License #{r.drivingLicense || 'AP00720220019284'}</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* IN-LINE DOCUMENT INSPECTION MODAL WITH ZOOM CONTROLS & VERIFICATION STAMPS */}
        {inspectDoc && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
              
              {/* Modal Topbar: Document Details & Zoom Toolbar */}
              <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      {inspectDoc.doc?.originalName || inspectDoc.doc?.fileName || 'Document Inspection'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Entity: <strong className="text-purple-300">{inspectDoc.entity?.businessName || inspectDoc.entity?.name}</strong> • Type: {inspectDoc.entityType.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Interactive Zoom Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-purple-300 w-12 text-center font-bold">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={handleRotate}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-0.5 rounded-md hover:bg-slate-700 text-[10px] text-slate-300 font-bold"
                  >
                    Reset
                  </button>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Inspection Viewport with Zoom & Rotation */}
              <div className="flex-1 bg-slate-950/90 overflow-auto p-6 flex items-center justify-center relative min-h-[360px]">
                {/* Visual Stamp Overlay if approved or rejected */}
                {successStamp && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div
                      className={`px-8 py-3 rounded-2xl border-4 font-black text-2xl tracking-widest uppercase transform -rotate-12 shadow-2xl animate-bounce ${
                        successStamp === 'APPROVED'
                          ? 'border-emerald-500 bg-emerald-950/80 text-emerald-400'
                          : 'border-red-500 bg-red-950/80 text-red-400'
                      }`}
                    >
                      STAMP: {successStamp}
                    </div>
                  </div>
                )}

                <div
                  className="transition-transform duration-150 ease-out origin-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                >
                  {inspectDoc.doc?.fileUrl?.endsWith('.pdf') ? (
                    <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-3 max-w-sm">
                      <FileText className="w-12 h-12 text-purple-600 mx-auto" />
                      <p className="font-bold text-sm text-slate-800">PDF Document Attached</p>
                      <a
                        href={inspectDoc.doc.fileUrl.startsWith('http') ? inspectDoc.doc.fileUrl : `${api.defaults.baseURL || ''}${inspectDoc.doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
                      >
                        <span>Open PDF in Secure Tab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <img
                      src={
                        inspectDoc.doc?.fileUrl
                          ? inspectDoc.doc.fileUrl.startsWith('http')
                            ? inspectDoc.doc.fileUrl
                            : `${api.defaults.baseURL || ''}${inspectDoc.doc.fileUrl}`
                          : '/logo.png'
                      }
                      alt="Compliance document preview"
                      className="max-h-[500px] max-w-full rounded-xl object-contain shadow-2xl border border-slate-700 bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Rejection Reason Form (Conditional) */}
              {showRejectPrompt && (
                <form onSubmit={handleStampReject} className="p-4 bg-red-50 border-t border-red-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900">Mandatory Reason for Rejection / Modification:</span>
                    <button
                      type="button"
                      onClick={() => setShowRejectPrompt(false)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify defect: e.g. FSSAI registration number mismatch or expired certificate date..."
                    className="w-full p-2.5 rounded-xl border border-red-300 font-medium focus:outline-none focus:border-red-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionInProgress}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Confirm Rejection Stamp
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Quick Verification Action Stamps Bar */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Clicking <strong className="text-emerald-700">Approve</strong> immediately updates database record to <strong className="font-mono">status: 'APPROVED'</strong> and grants dashboard access.
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectPrompt(true)}
                    disabled={actionInProgress}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reject with Reason
                  </button>

                  <button
                    type="button"
                    onClick={handleStampApprove}
                    disabled={actionInProgress}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Entity</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </AdminPortalLayout>
  );
}

