import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserSession } from '../utils/auth';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const session = getUserSession();

  if (!session) {
    return <Navigate to="/customer/auth" replace />;
  }

  if (requiredUserType && session.userType !== requiredUserType) {
    return <Navigate to="/customer/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;