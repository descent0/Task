const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { generateToken } = require('../middleware/auth')

const router = express.Router()

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => err.msg)
    })
  }
  next()
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    })

    await user.save()

    // Generate token
    const token = generateToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    })

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    })

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  require('../middleware/auth').authenticateToken,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = req.user

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email)
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' })
      }
      user.email = email
    }

    if (name) {
      user.name = name
    }

    await user.save()

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (clear cookie)
// @access  Private
router.post('/logout', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
// @access  Public
router.get('/check', require('../middleware/auth').optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    })
  } else {
    res.json({ authenticated: false })
  }
})

module.exports = router