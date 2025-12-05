const express = require('express')
const User = require('../models/User')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await User.countDocuments()
    const totalPages = Math.ceil(total / limit)

    res.json({
      users,
      pagination: {
        current: page,
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})



module.exports = router