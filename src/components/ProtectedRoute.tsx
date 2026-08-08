import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserProfile['role'];
}

// Role → default dashboard path
const ROLE_HOME: Record<UserProfile['role'], string> = {
  student: '/student',
  faculty: '/faculty',
  admin: '/admin',
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show nothing while Firebase resolves auth state — prevents flash-of-wrong-route
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-800 border-t-transparent" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in → send to login, preserving intended path for post-login redirect
  if (!currentUser || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → redirect to the correct dashboard for this user's role
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to={ROLE_HOME[userProfile.role]} replace />;
  }

  return <>{children}</>;
}
