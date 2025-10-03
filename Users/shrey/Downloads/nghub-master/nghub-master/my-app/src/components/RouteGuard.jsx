import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = ({ isPrivate }) => {
  const { user, isLoading } = useAuth();

  // Show a loading spinner while we check the user's status.
  // This prevents the page from flashing before a redirect.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Logic for PRIVATE routes (Dashboards, etc.)
  if (isPrivate) {
    // If it's a private route and there's NO user, redirect to login.
    // Otherwise, show the page.
    return user ? <Outlet /> : <Navigate to="/" replace />;
  }

  // Logic for PUBLIC routes (Login, Register)
  if (!isPrivate) {
    // If it's a public route and a user IS logged in, redirect them.
    if (user) {
      const dashboardPath = user.role === 'admin' ? '/admin' : '/employee';
      return <Navigate to={dashboardPath} replace />;
    }
    // Otherwise, show the public page.
    return <Outlet />;
  }
};

export default RouteGuard;
