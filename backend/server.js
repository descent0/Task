const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const articleRoutes = require('./routes/articles')
const userRoutes = require('./routes/users')

const app = express()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

app.use('/api', limiter)

// Special rate limiting for LLM endpoints
const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 LLM requests per minute
  message: 'Too many summarization requests, please try again later.',
})

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/users', userRoutes)

// Apply LLM rate limiting to summarize endpoints
app.use('/api/articles/*/summarize', llmLimiter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/article-management')
    
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('Database connection error:', error.message)
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
    console.log(`🤖 Using Gemini model: gemini-pro`)
  })
}

startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
  process.exit(1)
})

module.exports = app