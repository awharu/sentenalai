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
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <Layout><AdminPanel /></Layout>
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