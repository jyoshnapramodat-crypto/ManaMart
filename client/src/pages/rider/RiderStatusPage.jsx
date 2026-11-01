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
  RefreshCw,
  Bike,
  ArrowRight,
  PhoneCall,
  MapPin,
} from 'lucide-react';

export default function RiderStatusPage() {
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
      const res = await api.get('/riders/application-status');
      if (res.data.success) {
        setAppData(res.data);
        if (res.data.status === 'verified') {
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
            Rider Verification Status
          </h1>
          <p className="text-xs text-slate-500">
            Driving license audit & neighborhood partner approval
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 text-center">
          
          {loading ? (
            <div className="py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Auditing rider verification status...</p>
            </div>
          ) : status === 'verified' || status === 'approved' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                You Are Approved to Ride!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Congratulations {application?.name || 'Partner'}! Your driving credentials and vehicle have been approved. You can now toggle online and start earning.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/rider')}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Bike className="w-4 h-4" />
                  <span>Open Rider Partner Console</span>
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
                Application Needs Revision
              </h2>
              <p className="text-xs text-slate-600">
                Driving license image was unclear or vehicle registration mismatch.
              </p>
              <div className="pt-2">
                <Link
                  to="/rider/apply"
                  className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl transition-all"
                >
                  <span>Re-Submit Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Pending Review */
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>Rider Background Check in Progress</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 pt-1">
                  License Verification Underway
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ManaMart Admin is validating your driving license and vehicle registration.
                </p>
              </div>

              {/* Rider Summary */}
              <div className="bg-[#FCFBF8] rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
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
                  <span className="font-bold text-emerald-600">Typically Approved in ~1 Hour</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center space-x-3">
                <button
                  onClick={fetchStatus}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
              <span>Rider Helpdesk: 1800-MANAMART</span>
            </span>
            <Link to="/app" className="font-bold text-slate-700 hover:text-orange-600">
              Go to Marketplace
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

