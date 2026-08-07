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
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-400">Loading…</span>
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
