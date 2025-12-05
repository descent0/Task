const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then fallback to Authorization header
    let token = req.cookies?.token

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    return res.status(500).json({ error: 'Token verification failed' })
  }
}

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Check if user is owner or admin
const requireOwnershipOrAdmin = (userIdField = 'createdBy') => {
  return (req, res, next) => {
    const isAdmin = req.user.role === 'admin'
    const isOwner = req.resource && req.resource[userIdField] && 
                   req.resource[userIdField].toString() === req.user._id.toString()
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        error: 'Access denied. You can only modify your own resources.' 
      })
    }
    next()
  }
}

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then fallback to Authorization header
    let token = req.cookies?.token
    
    if (!token) {
      const authHeader = req.headers.authorization
      token = authHeader && authHeader.split(' ')[1]
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      const user = await User.findById(decoded.id).select('-password')
      
      if (user && user.isActive) {
        req.user = user
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next()
}

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role]
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    
    const hasRole = allowedRoles.some(role => userRoles.includes(role))
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      })
    }
    
    next()
  }
}

// Convenience functions for common roles
const requireUser = requireRole('user')

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth,
  requireRole,
  requireUser
}