import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireUploader = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check uploader requirement
  if (requireUploader && !user?.uploaderProfile?.isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Uploader Access Required</h1>
          <p className="text-gray-600 mb-4">
            You need to be an approved uploader to access this page.
          </p>
          {!user?.uploaderProfile ? (
            <a 
              href="/apply-uploader" 
              className="btn-primary"
            >
              Apply to Become an Uploader
            </a>
          ) : (
            <p className="text-yellow-600">
              Your uploader application is pending approval.
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;