import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, ArrowRight, UserCheck, Lock } from 'lucide-react';

export default function ProtectedRoute({
  children,
  allowedRoles = [], // e.g. ['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']
  requireVerification = true,
}) {
  const { user, token, isLoggedIn, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8ED] text-slate-500 font-medium">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Authenticating your neighborhood session...</span>
        </div>
      </div>
    );
  }

  // 1. Must be logged in
  if (!isLoggedIn || !user || !token) {
    const portalName = location.pathname.startsWith('/merchant')
      ? 'Merchant Workspace'
      : location.pathname.startsWith('/rider')
      ? 'Delivery Hero Console'
      : location.pathname.startsWith('/admin')
      ? 'Platform Governance'
      : 'ManaMart';

    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: `Please sign in to access the ${portalName}.`,
        }}
        replace
      />
    );
  }

  const userRole = (user.role || 'CUSTOMER').toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  // 2. Strict Cross-Role Access Control & Dedicated Unauthorized Notice
  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole) && userRole !== 'ADMIN') {
    let targetPortal = 'Customer Marketplace';
    let targetOnboardRoute = '/register';
    let targetRoleParam = 'customer';

    if (location.pathname.startsWith('/merchant')) {
      targetPortal = 'Merchant Enterprise Hub';
      targetOnboardRoute = '/merchant/onboard';
      targetRoleParam = 'merchant';
    } else if (location.pathname.startsWith('/rider')) {
      targetPortal = 'Delivery Hero Console';
      targetOnboardRoute = '/rider/onboard';
      targetRoleParam = 'rider';
    } else if (location.pathname.startsWith('/admin')) {
      targetPortal = 'Platform Root Governance';
      targetOnboardRoute = '/login?role=admin';
      targetRoleParam = 'admin';
    }

    const defaultDashboard =
      userRole === 'MERCHANT'
        ? '/merchant/dashboard'
        : userRole === 'RIDER'
        ? '/rider/dashboard'
        : userRole === 'ADMIN'
        ? '/admin/analytics'
        : '/app';

    return (
      <div className="min-h-screen bg-[#FFF8ED] flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>403 Unauthorized Access</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cross-Role Boundary Enforced
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your active account is authenticated as <strong className="text-slate-900 uppercase font-extrabold">{userRole}</strong>. Access to the <strong className="text-red-700">{targetPortal}</strong> is strictly restricted to authorized {targetRoleParam} credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Active Identity:</span>
              <span className="font-extrabold text-slate-800">{user.name} ({userRole})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Requested Path:</span>
              <span className="font-mono text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">{location.pathname}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Enforcement:</span>
              <span className="font-bold text-emerald-800">Zero-Trust Role Isolation Active</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(defaultDashboard)}
              className="flex-1 py-3 px-4 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Your Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate(`/login?role=${targetRoleParam}`);
              }}
              className="flex-1 py-3 px-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF6B00] rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch / Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Verification & Compliance Lifecycle Guard for Merchant & Rider
  if (requireVerification && userRole !== 'ADMIN') {
    const userStatus = (user.status || user.merchant_profile?.status || user.rider_profile?.status || 'active').toUpperCase();
    const isPending = userStatus === 'PENDING' || userStatus === 'PENDING_VERIFICATION' || userStatus === 'UNDER_REVIEW' || userStatus === 'CHANGES_REQUESTED';

    if (userRole === 'MERCHANT' && isPending && !location.pathname.endsWith('/status')) {
      return <Navigate to="/merchant/status" replace />;
    }

    if (userRole === 'RIDER' && isPending && !location.pathname.endsWith('/status')) {
      return <Navigate to="/rider/status" replace />;
    }
  }

  return children;
}
