/**
 * WHY: Prevents unauthenticated users from accessing private pages.
 *      Wraps React Router's route tree — clean declarative guard.
 * HOW: Reads isAuthenticated from Redux. Redirects to /login if false.
 *      replace={true} prevents back-button returning to the guarded page.
 * PRODUCTION STANDARD: Server-side JWT verification is the real guard.
 *      Client-side route protection is UX only — not a security measure.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
