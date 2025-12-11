import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserSession, isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔍 Checking authentication in ProtectedRoute...');

        // First check if user is authenticated
        if (!isAuthenticated()) {
          console.log('🚫 User not authenticated, redirecting to login');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        const session = getUserSession();

        if (!session) {
          console.log('🚫 No session found, redirecting to login');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        console.log('📋 Session found:', session.userType);

        // Check if specific user type is required
        if (requiredUserType && session.userType !== requiredUserType) {
          console.log(`🚫 User type mismatch. Required: ${requiredUserType}, Actual: ${session.userType}`);

          // Redirect based on user's actual type
          switch (session.userType) {
            case 'admin':
              setIsAuthorized('admin');
              break;
            case 'customer':
              setIsAuthorized('customer');
              break;
            case 'courier':
              setIsAuthorized('courier');
              break;
            default:
              setIsAuthorized(false);
          }
        } else {
          // User has required access or no specific type required
          console.log('✅ User authorized');
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requiredUserType]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Handle redirection based on authorization result
  if (isAuthorized === false) {
    console.log('🔀 Redirecting to login page');
    return <Navigate to="/customer/auth" replace />;
  }

  if (isAuthorized === 'admin') {
    console.log('🔀 Redirecting admin to admin dashboard');
    return <Navigate to="/admin" replace />;
  }

  if (isAuthorized === 'customer') {
    console.log('🔀 Redirecting customer to home');
    return <Navigate to="/customer/home" replace />;
  }

  if (isAuthorized === 'courier') {
    console.log('🔀 Redirecting courier to dashboard');
    return <Navigate to="/courier/dashboard" replace />;
  }

  // User is authorized and has correct role
  return children;
};

export default ProtectedRoute;