import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const RoleBasedComponent = ({ 
  allowedRoles = [], 
  requiredRole = null,
  children, 
  fallback = null,
  hideIfUnauthorized = false 
}) => {
  const { user, hasRole, hasAnyRole } = useAuth()

  // Not authenticated
  if (!user) {
    return hideIfUnauthorized ? null : fallback
  }

  // Check specific role
  if (requiredRole && !hasRole(requiredRole)) {
    return hideIfUnauthorized ? null : fallback
  }

  // Check multiple roles
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return hideIfUnauthorized ? null : fallback
  }

  // User has required permissions
  return children
}

// Convenience components for common roles
export const AdminOnly = ({ children, fallback = null, hideIfUnauthorized = false }) => (
  <RoleBasedComponent 
    requiredRole="admin" 
    fallback={fallback} 
    hideIfUnauthorized={hideIfUnauthorized}
  >
    {children}
  </RoleBasedComponent>
)

export const UserOnly = ({ children, fallback = null, hideIfUnauthorized = false }) => (
  <RoleBasedComponent 
    requiredRole="user" 
    fallback={fallback} 
    hideIfUnauthorized={hideIfUnauthorized}
  >
    {children}
  </RoleBasedComponent>
)

export const AuthenticatedOnly = ({ children, fallback = null, hideIfUnauthorized = false }) => {
  const { user } = useAuth()
  
  if (!user) {
    return hideIfUnauthorized ? null : fallback
  }
  
  return children
}

export default RoleBasedComponent