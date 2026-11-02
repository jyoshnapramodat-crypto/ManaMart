import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  allowedRoles = [], // e.g. ['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']
  requireVerification = true,
}) {
  const { user, token, isLoggedIn, loading } = useAuth();
  const location = useLocation();

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

  // 2. Strict Role Access Control
  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole) && userRole !== 'ADMIN') {
    let targetPortal = 'Customer';
    let registerPath = '/register';

    if (location.pathname.startsWith('/merchant')) {
      targetPortal = 'Merchant';
      registerPath = '/merchant/register';
    } else if (location.pathname.startsWith('/rider')) {
      targetPortal = 'Delivery Hero (Rider)';
      registerPath = '/rider/register';
    } else if (location.pathname.startsWith('/admin')) {
      targetPortal = 'Platform Governance';
      registerPath = '/login';
    }

    return (
      <Navigate
        to="/login"
        state={{
          error: `Access Denied: Your account role (${userRole}) is not authorized for the ${targetPortal} portal. Please register or sign in with an authorized ${targetPortal} account.`,
          from: location,
        }}
        replace
      />
    );
  }

  // 3. Verification & Compliance Lifecycle Guard for Merchant & Rider
  if (requireVerification && userRole !== 'ADMIN') {
    const userStatus = (user.status || user.merchant_profile?.status || user.rider_profile?.status || 'PENDING').toUpperCase();
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
