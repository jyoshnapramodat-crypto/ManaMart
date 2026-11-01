import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  allowedRoles = [], // e.g. ['customer', 'merchant', 'rider', 'admin']
  requireVerification = true,
}) {
  const { user, token, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] text-slate-500 font-medium">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Authenticating your neighborhood session...</span>
        </div>
      </div>
    );
  }

  // 1. Must be logged in
  if (!isLoggedIn || !user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If a customer tries to access the merchant owner dashboard
    if (user.role === 'customer' && location.pathname === '/merchant') {
      return <Navigate to="/merchant/apply" state={{ message: 'Please register your store or restaurant first to access the merchant dashboard.' }} replace />;
    }
    // If a customer tries to access the rider courier dashboard
    if (user.role === 'customer' && location.pathname === '/rider') {
      return <Navigate to="/rider/apply" state={{ message: 'Please register as a delivery partner first to access the rider dashboard.' }} replace />;
    }
    // If merchant or rider tries to access something outside their scope
    if (user.role === 'merchant') return <Navigate to="/merchant" replace />;
    if (user.role === 'rider') return <Navigate to="/rider" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/app" replace />;
  }

  // 3. Verification & Compliance Check for Merchant & Rider
  if (requireVerification) {
    if (user.role === 'merchant' && user.status === 'pending' && location.pathname === '/merchant') {
      return <Navigate to="/merchant/status" replace />;
    }
    if (user.role === 'rider' && user.status === 'pending' && location.pathname === '/rider') {
      return <Navigate to="/rider/status" replace />;
    }
  }

  return children;
}

