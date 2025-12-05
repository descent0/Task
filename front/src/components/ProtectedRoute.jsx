import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [], 
  redirectTo = '/login',
  fallback = null 
}) => {
  const { user, loading, hasRole, hasAnyRole } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate 
      to={redirectTo} 
      state={{ from: location }} 
      replace 
    />
  }

  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need <strong>{requiredRole}</strong> role to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your current role: <strong>{user.role}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Check multiple roles requirement
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need one of these roles: <strong>{requiredRoles.join(', ')}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your current role: <strong>{user.role}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and has required permissions
  return children
}

export default ProtectedRoute