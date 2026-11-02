/**
 * PhishShield Application Root
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';

import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { UrlAnalyzerPage } from './pages/UrlAnalyzerPage.tsx';
import { EmailAnalyzerPage } from './pages/EmailAnalyzerPage.tsx';
import { ThreatDirectoryPage } from './pages/ThreatDirectoryPage.tsx';
import { AwarenessCenterPage } from './pages/AwarenessCenterPage.tsx';
import { ScanHistoryPage } from './pages/ScanHistoryPage.tsx';
import { SecurityReportPage } from './pages/SecurityReportPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.tsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading session credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#0a0f1d] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/analyzer/url" element={<UrlAnalyzerPage />} />
              <Route path="/analyzer/email" element={<EmailAnalyzerPage />} />
              <Route path="/threats" element={<ThreatDirectoryPage />} />
              <Route path="/awareness" element={<AwarenessCenterPage />} />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <ScanHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/security-tests" element={<SecurityReportPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
