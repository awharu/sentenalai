import React, { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: PropsWithChildren<ProtectedRouteProps>) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};