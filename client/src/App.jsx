import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';

import QuickRoleSwitcher from './components/QuickRoleSwitcher';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import DevMailboxDrawer from './components/DevMailboxDrawer';

// Public & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer Pages
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

// Merchant Onboarding & Dashboard Pages
import MerchantOnboardingPage from './pages/merchant/MerchantOnboardingPage';
import MerchantStatusPage from './pages/merchant/MerchantStatusPage';
import MerchantDashboardPage from './pages/merchant/MerchantDashboardPage';

// Rider Onboarding & Dashboard Pages
import RiderOnboardingPage from './pages/rider/RiderOnboardingPage';
import RiderStatusPage from './pages/rider/RiderStatusPage';
import RiderDashboardPage from './pages/rider/RiderDashboardPage';

// Admin Governance Page
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Offline Connectivity Status Banner (Module 14) */}
      <OfflineBanner />

      {/* Animated Brand Splash Screen (Only on initial visit per session) */}
      <SplashScreen />

      {/* Test Simulator Top Toolbar */}
      <QuickRoleSwitcher />

      {/* Top Navigation (Hidden on Landing and Auth pages to preserve custom immersive design) */}
      {!isLanding && !isAuthPage && <Navbar />}

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          {/* Public Root: High-Conversion Hyperlocal Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dedicated Authentication & Identity Flows */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Customer Marketplace Catalog (Guest Mode Enabled - Module 1) */}
          <Route path="/app" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* Canonical Store Profile & Backward-Compatible Merchant Link */}
          <Route path="/store/:id" element={<MerchantDetailsPage />} />
          <Route path="/merchant/:id" element={<MerchantDetailsPage />} />
          
          {/* Social Feed & Community Updates */}
          <Route path="/feed" element={<SocialFeedPage />} />

          {/* Table Reservations & Dining Booking */}
          <Route path="/reservations" element={<ReservationsPage />} />

          {/* Neighborhood Services (Maids, Plumbers, Electricians) */}
          <Route path="/services" element={<ServicesPage />} />

          {/* Customer Help, FAQs & Complaint Tickets (Module 9) */}
          <Route path="/support" element={<SupportPage />} />

          {/* Settings, Language (English/Telugu) & Accessibility (Module 13) */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Customer Account & Wallet Profile Hub */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Authenticated Customer Flows */}
          <Route
            path="/recurring"
            element={
              <ProtectedRoute allowedRoles={['customer', 'merchant', 'rider', 'admin']}>
                <RecurringListsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer', 'merchant', 'rider', 'admin']}>
                <OrdersHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={['customer', 'merchant', 'rider', 'admin']}>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parcel"
            element={
              <ProtectedRoute allowedRoles={['customer', 'merchant', 'rider', 'admin']}>
                <ParcelDeliveryPage />
              </ProtectedRoute>
            }
          />

          {/* Merchant Workflow: Onboarding -> Regulatory Audit -> Verified Store */}
          <Route
            path="/merchant/apply"
            element={
              <ProtectedRoute allowedRoles={['merchant', 'customer', 'admin']} requireVerification={false}>
                <MerchantOnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/status"
            element={
              <ProtectedRoute allowedRoles={['merchant', 'customer', 'admin']} requireVerification={false}>
                <MerchantStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={['merchant', 'admin']} requireVerification={true}>
                <MerchantDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Rider Partner Workflow: Onboarding -> License Audit -> Active Courier */}
          <Route
            path="/rider/apply"
            element={
              <ProtectedRoute allowedRoles={['rider', 'customer', 'admin']} requireVerification={false}>
                <RiderOnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/status"
            element={
              <ProtectedRoute allowedRoles={['rider', 'customer', 'admin']} requireVerification={false}>
                <RiderStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRoles={['rider', 'admin']} requireVerification={true}>
                <RiderDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Platform Governance Console */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback to Landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {/* Shared Cart, Location & Dev Mailbox Overlays */}
      <CartDrawer />
      <LocationModal />
      <DevMailboxDrawer />

      {/* Mobile-First Bottom Navigation (Shown in app pages) */}
      {!isLanding && !isAuthPage && <BottomNav />}
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
