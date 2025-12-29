import React, { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { STORAGE_KEYS } from '../constants';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: PropsWithChildren<ProtectedRouteProps>) => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};