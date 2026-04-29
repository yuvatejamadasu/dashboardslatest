import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading && (!user || !userData)) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1d21]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
          <p className="text-slate-400 text-sm font-bold tracking-widest animate-pulse">VERIFYING SESSION...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Determine which login page to redirect to
    if (location.pathname.startsWith('/hub-dashboard')) return <Navigate to="/hub-login" replace />;
    if (location.pathname.startsWith('/store-dashboard')) return <Navigate to="/store-login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!userData || !allowedRoles.includes(userData.role)) {
      // Role not authorized - redirect to a safe page based on role or to login
      if (!userData) return <Navigate to="/login" replace />;
      if (userData.role === 'hub_admin') return <Navigate to="/hub-dashboard" replace />;
      if (userData.role === 'store_admin') return <Navigate to="/store-dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    // Status check - only allow 'Active' accounts (except super_admin who are always active by default)
    if (userData.status !== 'Active' && userData.role !== 'super_admin') {
      const loginPath = userData.role === 'hub_admin' ? '/hub-login' : '/store-login';
      return <Navigate to={loginPath} replace state={{ message: 'Your account is pending approval from Super Admin.' }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
