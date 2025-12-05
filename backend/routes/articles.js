const express = require('express')
const { body, query, validationResult } = require('express-validator')
const Article = require('../models/Article')
const { 
  authenticateToken, 
  requireAdmin, 
  requireOwnershipOrAdmin,
  optionalAuth 
} = require('../middleware/auth')
const llmService = require('../services/llmService')
const pdfService = require('../services/pdfService')

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

// Middleware to get article and check ownership
const getArticleAndCheckOwnership = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('createdBy', 'name email')
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    
    req.resource = article
    next()
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid article ID' })
    }
    next(error)
  }
}

// @route   GET /api/articles
// @desc    Get all articles with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  optionalAuth,

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),

  // ✅ FIXED VALIDATOR (this was crashing your server)
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string')
    .trim(),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'title', '-title', 'updatedAt', '-updatedAt'])
    .withMessage('Invalid sort parameter'),

], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    
    const queryObj = {}

    if (req.query.search) {
      queryObj.$text = { $search: req.query.search }
    }
    
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase())
      queryObj.tags = { $in: tags }
    }
    
    if (req.query.userId && req.user) {
      queryObj.createdBy = req.query.userId
    }
    
    const sortBy = req.query.sort || '-createdAt'
    
    const articles = await Article.find(queryObj)
      .populate('createdBy', 'name email')
      .sort(sortBy)
      .limit(limit)
      .skip(skip)
    
    const total = await Article.countDocuments(queryObj)
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      articles,
      pagination: {
        current: page,
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null
      }
    })
  } catch (error) {
    console.error('Get articles error:', error)
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

// @route   GET /api/articles/:id
router.get('/:id', [
  optionalAuth,
  getArticleAndCheckOwnership
], async (req, res) => {
  try {
    const article = req.resource
    
    if (!req.user || req.user._id.toString() !== article.createdBy._id.toString()) {
      await article.incrementViewCount()
    }
    
    res.json({ article })
  } catch (error) {
    console.error('Get article error:', error)
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

// @route   POST /api/articles
router.post('/', [
  authenticateToken,
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
], handleValidationErrors, async (req, res) => {
  try {
    const { title, content, tags } = req.body
    
    const article = new Article({
      title,
      content,
      tags: tags || [],
      createdBy: req.user._id
    })
    
    await article.save()
    await article.populate('createdBy', 'name email')
    
    res.status(201).json({
      message: 'Article created successfully',
      article
    })
  } catch (error) {
    console.error('Create article error:', error)
    res.status(500).json({ error: 'Failed to create article' })
  }
})

// @route   PUT /api/articles/:id
router.put('/:id', [
  authenticateToken,
  getArticleAndCheckOwnership,
  requireOwnershipOrAdmin(),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
], handleValidationErrors, async (req, res) => {
  try {
    const { title, content, tags } = req.body
    const article = req.resource
    
    if (title !== undefined) {
      article.title = title
    }
    if (content !== undefined) {
      article.content = content
    }
    if (tags !== undefined) {
      article.tags = tags
    }
    
    await article.save()
    await article.populate('createdBy', 'name email')
    
    res.json({
      message: 'Article updated successfully',
      article
    })
  } catch (error) {
    console.error('Update article error:', error)
    res.status(500).json({ error: 'Failed to update article' })
  }
})

// @route   DELETE /api/articles/:id
router.delete('/:id', [
  authenticateToken,
  requireAdmin,
  getArticleAndCheckOwnership
], async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id)
    
    res.json({
      message: 'Article deleted successfully'
    })
  } catch (error) {
    console.error('Delete article error:', error)
    res.status(500).json({ error: 'Failed to delete article' })
  }
})

// @route   POST /api/articles/:id/summarize
router.post('/:id/summarize', [
  authenticateToken,
  getArticleAndCheckOwnership,
  body('provider')
    .optional()
    .isIn(['gemini'])
    .withMessage('Provider must be "gemini"'),
], handleValidationErrors, async (req, res) => {
  try {
    const article = req.resource
    const provider = req.body.provider || 'gemini'
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (article.summarizedAt && article.summarizedAt > oneHourAgo) {
      return res.status(429).json({
        error: 'Article was recently summarized. Please wait before generating a new summary.',
        nextAllowed: new Date(article.summarizedAt.getTime() + 60 * 60 * 1000)
      })
    }
    
    const result = await llmService.summarize(article.content)
    
    article.summary = result.summary
    article.summarizedAt = new Date()
    article.summarizedBy = provider
    
    await article.save()
    await article.populate('createdBy', 'name email')
    
    res.json({
      message: 'Summary generated successfully',
      article,
      summaryInfo: {
        provider: result.provider,
        model: result.model,
        wordCount: result.wordCount,
        originalWordCount: llmService.countWords(article.content)
      }
    })
  } catch (error) {
    console.error('Summarize article error:', error)
    
    if (error.message.includes('API key')) {
      return res.status(503).json({ error: 'AI service not available: ' + error.message })
    }
    
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return res.status(429).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to generate summary: ' + error.message })
  }
})

// @route   GET /api/articles/tags/all
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await Article.distinct('tags')
    
    res.json({
      tags: tags.sort()
    })
  } catch (error) {
    console.error('Get tags error:', error)
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
})



// @route   GET /api/articles/:id/export/pdf
router.get('/:id/export/pdf', [
  authenticateToken,
  getArticleAndCheckOwnership
], async (req, res) => {
  try {
    const article = req.resource
    
    const { buffer } = await pdfService.generateArticlePDF(article)
    const filename = pdfService.generateFilename(article)
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length)
    
    res.send(buffer)
  } catch (error) {
    console.error('PDF export error:', error)
    res.status(500).json({ error: 'Failed to export PDF: ' + error.message })
  }
})

// @route   GET /api/articles/stats/overview
router.get('/stats/overview', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments()
    const totalUsers = await require('../models/User').countDocuments()
    const articlesWithSummary = await Article.countDocuments({ summary: { $exists: true, $ne: '' } })
    const totalViews = await Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ])
    
    const topTags = await Article.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    
    res.json({
      totalArticles,
      totalUsers,
      articlesWithSummary,
      totalViews: totalViews[0]?.totalViews || 0,
      topTags
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

module.exports = router
