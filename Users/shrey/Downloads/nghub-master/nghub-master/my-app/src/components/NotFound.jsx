import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Start countdown
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 3 seconds
    const redirectTimer = setTimeout(() => {
      if (isAuthenticated) {
        // If user is authenticated, log them out first
        logout();
      } else {
        // If not authenticated, just redirect to login
        navigate('/login', { replace: true });
      }
    }, 3000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(redirectTimer);
    };
  }, [logout, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
      <div className="text-center p-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-red-500">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            The page you're looking for doesn't exist. You will be automatically logged out and redirected to login.
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500">
            Redirecting to login in {countdown} seconds...
          </p>
          <button
            onClick={() => {
              if (isAuthenticated) {
                logout();
              } else {
                navigate('/login', { replace: true });
              }
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
