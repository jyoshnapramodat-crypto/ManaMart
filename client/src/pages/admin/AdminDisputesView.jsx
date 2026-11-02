import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPortalLayout from '../../components/admin/AdminPortalLayout';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  User,
} from 'lucide-react';

export default function AdminDisputesView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports');
      if (res.data?.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, actionTaken) => {
    try {
      const res = await api.put(`/admin/reports/${id}`, {
        status: 'resolved',
        actionTaken,
        resolutionNotes: `Action [${actionTaken}] executed by Admin.`,
      });
      if (res.data?.success) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report');
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Disputes & Complaint Tickets
            </h1>
            <p className="text-xs text-slate-500">
              Community moderation, refund escalations, and store violation resolution
            </p>
          </div>

          <button
            onClick={fetchDisputes}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading complaints and disputes...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No Active Disputes</p>
            <p>Customer satisfaction index is 99.4%. No escalated complaints.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-amber-700">
                    Category: {rep.category || 'Order Dispute'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Reported {new Date(rep.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-slate-900">{rep.reason || 'Item quality issue'}</p>
                  <p className="text-slate-600">{rep.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[10px]">Entity: {rep.targetType} #{rep.targetId}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolve(rep.id, 'refund_issued')}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 cursor-pointer"
                    >
                      Issue Full Refund
                    </button>
                    <button
                      onClick={() => handleResolve(rep.id, 'dismissed')}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                    >
                      Dismiss Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPortalLayout>
  );
}

