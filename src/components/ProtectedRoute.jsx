/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  // Direct check instead of function
  const authenticated = !!token && !!user;

  console.log('🔒 ProtectedRoute Check:', {
    loading,
    authenticated,
    hasToken: !!token,
    hasUser: !!user,
    userRole: user?.role,
    location: location.pathname,
    requiredRoles: roles
  });

  if (loading) {
    console.log('🔒 ProtectedRoute: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    console.log('🔒 ProtectedRoute: Insufficient permissions, user role:', user.role);
    return <Navigate to="/my-attendance" replace />;
  }

  console.log('🔒 ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;
