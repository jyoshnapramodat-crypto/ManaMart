import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';

// Public & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer Portal Pages
import HomePage from './pages/customer/HomePage';
import MerchantDetailsPage from './pages/customer/MerchantDetailsPage';
import SearchPage from './pages/customer/SearchPage';
import SocialFeedPage from './pages/customer/SocialFeedPage';
import RecurringListsPage from './pages/customer/RecurringListsPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrdersHistoryPage from './pages/customer/OrdersHistoryPage';
import ParcelDeliveryPage from './pages/customer/ParcelDeliveryPage';
import ReservationsPage from './pages/customer/ReservationsPage';
import ServicesPage from './pages/customer/ServicesPage';
import SupportPage from './pages/customer/SupportPage';
import SettingsPage from './pages/customer/SettingsPage';
import ProfilePage from './pages/customer/ProfilePage';
import NotificationCenterPage from './pages/customer/NotificationCenterPage';

// Merchant Dedicated Portal Views
import MerchantOnboardingPage from './pages/merchant/MerchantOnboardingPage';
import MerchantStatusPage from './pages/merchant/MerchantStatusPage';
import MerchantDashboardView from './pages/merchant/MerchantDashboardView';
import MerchantOrdersView from './pages/merchant/MerchantOrdersView';
import MerchantMenuView from './pages/merchant/MerchantMenuView';
import MerchantReservationsView from './pages/merchant/MerchantReservationsView';
import MerchantFinanceView from './pages/merchant/MerchantFinanceView';

// Delivery Hero (Rider) Dedicated Portal Views
import RiderOnboardingPage from './pages/rider/RiderOnboardingPage';
import RiderStatusPage from './pages/rider/RiderStatusPage';
import RiderDashboardView from './pages/rider/RiderDashboardView';
import RiderActiveTripView from './pages/rider/RiderActiveTripView';
import RiderEarningsView from './pages/rider/RiderEarningsView';
import RiderHistoryView from './pages/rider/RiderHistoryView';

// Admin Control Center Dedicated Views
import AdminAnalyticsView from './pages/admin/AdminAnalyticsView';
import AdminVerificationsView from './pages/admin/AdminVerificationsView';
import AdminMerchantsQueueView from './pages/admin/AdminMerchantsQueueView';
import AdminRidersQueueView from './pages/admin/AdminRidersQueueView';
import AdminDisputesView from './pages/admin/AdminDisputesView';
import AdminTeamView from './pages/admin/AdminTeamView';
import AdminAcceptInviteView from './pages/admin/AdminAcceptInviteView';

// Development Utilities (Conditionally rendered in development mode only)
import QuickRoleSwitcher from './components/QuickRoleSwitcher';
import DevMailboxDrawer from './components/DevMailboxDrawer';

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  const isLanding = path === '/';
  const isAuthPage = ['/login', '/signup', '/register', '/forgot-password', '/admin/accept-invite'].includes(path);
  const isMerchantPortal = path.startsWith('/merchant');
  const isRiderPortal = path.startsWith('/rider');
  const isAdminPortal = path.startsWith('/admin') && path !== '/admin/accept-invite';

  // Strict UI isolation: consumer nav, cart, and location modals NEVER render on merchant, rider, or admin portals
  const isCustomerPortal = !isMerchantPortal && !isRiderPortal && !isAdminPortal && !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Offline Connectivity Status Banner */}
      <OfflineBanner />

      {/* Animated Brand Splash Screen (Only on initial visit per session) */}
      <SplashScreen />

      {/* Consumer Top Navigation: ONLY on Customer Marketplace, NEVER on Merchant/Rider/Admin Portals */}
      {isCustomerPortal && !isLanding && <Navbar />}

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          {/* ========================================================== */}
          {/* 1. CUSTOMER PORTAL                                         */}
          {/* ========================================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/store/:id" element={<MerchantDetailsPage />} />
          <Route path="/merchant/:id" element={<MerchantDetailsPage />} />
          <Route path="/feed" element={<SocialFeedPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Authenticated Customer Routes */}
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']}>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']}>
                <RecurringListsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']}>
                <OrdersHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']}>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parcel"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'MERCHANT', 'RIDER', 'ADMIN']}>
                <ParcelDeliveryPage />
              </ProtectedRoute>
            }
          />

          {/* ========================================================== */}
          {/* 2. AUTHENTICATION & ONBOARDING                             */}
          {/* ========================================================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dedicated Merchant Registration & Status */}
          <Route path="/merchant/register" element={<MerchantOnboardingPage />} />
          <Route path="/merchant/apply" element={<MerchantOnboardingPage />} />
          <Route path="/merchant/status" element={<MerchantStatusPage />} />

          {/* Dedicated Rider Registration & Status */}
          <Route path="/rider/register" element={<RiderOnboardingPage />} />
          <Route path="/rider/apply" element={<RiderOnboardingPage />} />
          <Route path="/rider/status" element={<RiderStatusPage />} />

          {/* ========================================================== */}
          {/* 3. MERCHANT WORKSPACE PORTAL                               */}
          {/* ========================================================== */}
          <Route path="/merchant" element={<Navigate to="/merchant/dashboard" replace />} />
          <Route
            path="/merchant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']} requireVerification={true}>
                <MerchantDashboardView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/orders"
            element={
              <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']} requireVerification={true}>
                <MerchantOrdersView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/menu"
            element={
              <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']} requireVerification={true}>
                <MerchantMenuView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/reservations"
            element={
              <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']} requireVerification={true}>
                <MerchantReservationsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/finance"
            element={
              <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']} requireVerification={true}>
                <MerchantFinanceView />
              </ProtectedRoute>
            }
          />

          {/* ========================================================== */}
          {/* 4. DELIVERY HERO (RIDER) CONSOLE                           */}
          {/* ========================================================== */}
          <Route path="/rider" element={<Navigate to="/rider/dashboard" replace />} />
          <Route
            path="/rider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']} requireVerification={true}>
                <RiderDashboardView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/active-trip"
            element={
              <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']} requireVerification={true}>
                <RiderActiveTripView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/earnings"
            element={
              <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']} requireVerification={true}>
                <RiderEarningsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/history"
            element={
              <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']} requireVerification={true}>
                <RiderHistoryView />
              </ProtectedRoute>
            }
          />

          {/* ========================================================== */}
          {/* 5. ADMIN CONTROL CENTER                                    */}
          {/* ========================================================== */}
          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAnalyticsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminVerificationsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/merchants/pending"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMerchantsQueueView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/riders/pending"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminRidersQueueView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDisputesView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTeamView />
              </ProtectedRoute>
            }
          />

          {/* Secure Admin Invitation Acceptance (Public Tokenized Route) */}
          <Route path="/admin/accept-invite" element={<AdminAcceptInviteView />} />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Customer Overlays: Only rendered in Customer Portal */}
      {isCustomerPortal && (
        <>
          <CartDrawer />
          <LocationModal />
          {!isLanding && <BottomNav />}
        </>
      )}

      {/* Development Utilities: Rendered strictly when NODE_ENV === 'development' */}
      {Boolean(import.meta.env.DEV) && (
        <>
          <QuickRoleSwitcher />
          <DevMailboxDrawer />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
