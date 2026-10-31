import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';

import QuickRoleSwitcher from './components/QuickRoleSwitcher';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';

import HomePage from './pages/customer/HomePage';
import MerchantDetailsPage from './pages/customer/MerchantDetailsPage';
import SocialFeedPage from './pages/customer/SocialFeedPage';
import RecurringListsPage from './pages/customer/RecurringListsPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrdersHistoryPage from './pages/customer/OrdersHistoryPage';
import ParcelDeliveryPage from './pages/customer/ParcelDeliveryPage';
import ReservationsPage from './pages/customer/ReservationsPage';
import ServicesPage from './pages/customer/ServicesPage';
import LoginPage from './pages/auth/LoginPage';

import MerchantDashboardPage from './pages/merchant/MerchantDashboardPage';
import RiderDashboardPage from './pages/rider/RiderDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans">
              {/* Test Simulator Top Toolbar */}
              <QuickRoleSwitcher />

              {/* Top Navigation */}
              <Navbar />

              {/* Main Content Router */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/merchant/:id" element={<MerchantDetailsPage />} />
                  <Route path="/feed" element={<SocialFeedPage />} />
                  <Route path="/recurring" element={<RecurringListsPage />} />
                  <Route path="/orders" element={<OrdersHistoryPage />} />
                  <Route path="/orders/:id" element={<OrderTrackingPage />} />
                  <Route path="/parcel" element={<ParcelDeliveryPage />} />
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Multi-Role Dashboards */}
                  <Route path="/merchant" element={<MerchantDashboardPage />} />
                  <Route path="/rider" element={<RiderDashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                </Routes>
              </main>

              {/* Shared Overlays */}
              <CartDrawer />
              <LocationModal />

              {/* Mobile-First Bottom Navigation */}
              <BottomNav />
            </div>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

