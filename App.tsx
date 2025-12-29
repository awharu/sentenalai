import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserRole } from './types';

// Components
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/Admin';
import Login from './pages/Login';
import Documents from './pages/Documents';
import ArchiveSearch from './pages/ArchiveSearch';
import Identities from './pages/Identities';
import AccessControl from './pages/AccessControl';
import Geospatial from './pages/Geospatial';
import AuditLog from './pages/AuditLog';
import MobileApp from './pages/MobileApp';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <HashRouter>
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
      </Routes>
    </HashRouter>
  );
}