const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters']
  },
  summary: {
    type: String,
    maxlength: [1000, 'Summary must be less than 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag must be less than 30 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  // Track summarization metadata
  summarizedAt: {
    type: Date
  },
  summarizedBy: {
    type: String,
    enum: ['gemini']
  }
}, {
  timestamps: true
})

// Indexes for performance
articleSchema.index({ createdBy: 1 })
articleSchema.index({ tags: 1 })
articleSchema.index({ createdAt: -1 })
articleSchema.index({ title: 'text', content: 'text' }) // Text search index

// Virtual for article URL
articleSchema.virtual('url').get(function() {
  return `/articles/${this._id}`
})

// Instance method to increment view count
articleSchema.methods.incrementViewCount = function() {
  this.viewCount += 1
  return this.save()
}

// Static method to find by tag
articleSchema.statics.findByTag = function(tag) {
  return this.find({ tags: { $in: [tag.toLowerCase()] } })
}

// Static method to search articles
articleSchema.statics.searchArticles = function(query) {
  return this.find({
    $text: { $search: query }
  }).populate('createdBy', 'name email')
}

// Pre-save middleware to clean tags
articleSchema.pre('save', function(next) {
  if (this.tags) {
    // Remove empty tags and duplicates
    this.tags = [...new Set(
      this.tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    )]
  }
  next()
})

module.exports = mongoose.model('Article', articleSchema)