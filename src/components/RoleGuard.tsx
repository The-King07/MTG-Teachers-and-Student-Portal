import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: Array<'STUDENT' | 'TEACHER' | 'PARENT'>;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-700">Loading Make The Grade...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their own role dashboard if trying to access unauthorized role route
    const defaultRoute =
      user.role === 'TEACHER'
        ? '/teacher/dashboard'
        : user.role === 'PARENT'
        ? '/parent/dashboard'
        : '/student/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};
