import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 18 Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import RiderDashboardPage from './pages/RiderDashboardPage';
import FindChargersPage from './pages/FindChargersPage';
import MapPage from './pages/MapPage';
import ChargerDetailsPage from './pages/ChargerDetailsPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import HostDashboardPage from './pages/HostDashboardPage';
import AddChargerPage from './pages/AddChargerPage';
import ManageListingsPage from './pages/ManageListingsPage';
import HostEarningsPage from './pages/HostEarningsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';

// Route guards
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '13px'
              }
            }}
          />

          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/chargers" element={<FindChargersPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/chargers/:id" element={<ChargerDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Rider Protected Pages */}
              <Route
                path="/rider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']}>
                    <RiderDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:id"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/bookings"
                element={
                  <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']}>
                    <BookingHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Host Protected Pages */}
              <Route
                path="/host/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                    <HostDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/add-charger"
                element={
                  <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                    <AddChargerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/listings"
                element={
                  <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                    <ManageListingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/earnings"
                element={
                  <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
                    <HostEarningsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Pages */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Common Profile Page */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
