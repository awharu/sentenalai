import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DroneProvider } from './contexts/DroneStateContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Components
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy Loaded Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminPanel = React.lazy(() => import('./pages/Admin'));
const Login = React.lazy(() => import('./pages/Login'));
const Documents = React.lazy(() => import('./pages/Documents'));
const ArchiveSearch = React.lazy(() => import('./pages/ArchiveSearch'));
const Identities = React.lazy(() => import('./pages/Identities'));
const AccessControl = React.lazy(() => import('./pages/AccessControl'));
const Geospatial = React.lazy(() => import('./pages/Geospatial'));
const AuditLog = React.lazy(() => import('./pages/AuditLog'));
const MobileApp = React.lazy(() => import('./pages/MobileApp'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

const FullPageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-blue-500">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
    <span className="text-sm font-medium animate-pulse">Initializing SentinelAI...</span>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <DroneProvider>
            <HashRouter>
              <Suspense fallback={<FullPageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/map" element={
                  <ProtectedRoute>
                    <Layout><Geospatial /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/identities" element={
                  <ProtectedRoute>
                    <Layout><Identities /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/access-control" element={
                  <ProtectedRoute>
                    <Layout><AccessControl /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/search" element={
                  <ProtectedRoute>
                    <Layout><ArchiveSearch /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Layout><AdminPanel /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/audit-logs" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Layout><AuditLog /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/mobile" element={
                  <ProtectedRoute>
                    <Layout><MobileApp /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/documents" element={
                  <ProtectedRoute>
                    <Layout><Documents /></Layout>
                  </ProtectedRoute>
                } />

                {/* Catch all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </DroneProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}