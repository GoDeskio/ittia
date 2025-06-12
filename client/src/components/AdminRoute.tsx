import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'god';
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, requiredRole = 'admin' }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    (requiredRole === 'admin' && !['admin', 'god'].includes(user.role)) ||
    (requiredRole === 'god' && user.role !== 'god')
  ) {
    // Not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute; 