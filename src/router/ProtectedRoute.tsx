import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routes';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  component: React.ComponentType;
  roles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, roles }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Component />;
};
