import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await authService.checkAuth()
      if (response.data.authenticated) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // User is not authenticated, which is fine
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password })
      const { user: userData } = response.data
      
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await authService.register({ 
        email, 
        password, 
        name 
      })
      const { user: userData } = response.data
      
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      console.error('Registration failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
      // Continue with logout even if server request fails
    }
    setUser(null)
  }

  // RBAC helper functions
  const hasRole = (role) => {
    if (!user) return false
    const userRoles = Array.isArray(user.role) ? user.role : [user.role]
    return userRoles.includes(role)
  }

  const hasAnyRole = (roles) => {
    if (!user) return false
    const userRoles = Array.isArray(user.role) ? user.role : [user.role]
    return roles.some(role => userRoles.includes(role))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    // Convenience role checkers
    isAdmin: hasRole('admin'),
    isUser: hasRole('user')
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}