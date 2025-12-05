import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { articleAPI } from '../services/api'
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Tag,
  FileText
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Get all unique tags from articles
  const allTags = [...new Set(articles.flatMap(article => article.tags || []))]

  useEffect(() => {
    fetchArticles()
  }, [sortBy, sortOrder])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await articleAPI.getAll({
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
      })
      setArticles(response.data.articles || response.data)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (articleId) => {
    if (!isAdmin) {
      toast.error('Only admins can delete articles')
      return
    }

    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await articleAPI.delete(articleId)
        setArticles(articles.filter(article => article._id !== articleId))
        toast.success('Article deleted successfully')
      } catch (error) {
        console.error('Failed to delete article:', error)
        toast.error('Failed to delete article')
      }
    }
  }

  // Filter articles based on search and tag
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === '' || (article.tags && article.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <LoadingSpinner text="Loading articles..." />
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 animate-slide-in-left">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            ✨ Article Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>! 
            {isAdmin && (
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-full text-sm font-medium">
                Admin
              </span>
            )}
          </p>
        </div>
        <Link
          to="/articles/create"
          className="btn-primary px-6 py-3 mt-4 sm:mt-0 text-base animate-bounce-gentle"
        >
          <Plus size={20} className="mr-2" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6 mb-8 animate-slide-in-right">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="updatedAt">Last Updated</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="glass rounded-2xl p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {articles.length === 0 ? '🚀 Ready to start writing?' : '🔍 No matches found'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {articles.length === 0 
                ? 'Create your first article and start sharing your knowledge with the world.'
                : 'Try adjusting your search criteria or filters to find what you\'re looking for.'
              }
            </p>
            {articles.length === 0 && (
              <Link to="/articles/create" className="btn-primary text-base px-8 py-3">
                <Plus size={20} className="mr-2" />
                Create Your First Article
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {filteredArticles.map((article, index) => (
            <div 
              key={article._id} 
              className="card-hover p-6 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Article Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  {article.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm line-clamp-3 leading-relaxed">
                  {article.summary || article.content?.substring(0, 150) + '...'}
                </p>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 dark:from-primary-800/50 dark:to-primary-900/50 dark:text-primary-200 hover:scale-105 transition-transform duration-200"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{article.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Article Meta */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Calendar size={16} className="mr-2 text-primary-500" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <User size={16} className="mr-2 text-primary-500" />
                  <span className="font-medium">{article.createdBy?.name || article.createdBy?.email || 'Unknown'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-secondary-200/50 dark:border-secondary-700/50">
                <Link
                  to={`/articles/${article._id}`}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  <Eye size={16} className="mr-2" />
                  View
                </Link>
                
                <div className="flex items-center space-x-2">
                  {(isAdmin || article.createdBy?._id === user?.id) && (
                    <Link
                      to={`/articles/${article._id}/edit`}
                      className="p-2 rounded-lg text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors duration-200"
                    >
                      <Edit size={16} />
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="p-2 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {articles.length > 0 && (
        <div className="mt-12 animate-slide-up">
          <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
            📊 Dashboard Analytics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-primary-200 dark:border-primary-700">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {articles.length}
              </div>
              <div className="text-sm font-medium text-primary-700 dark:text-primary-300">Total Articles</div>
              <div className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-1">Published content</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/30 border-success-200 dark:border-success-700">
              <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">
                {articles.filter(a => a.createdBy?._id === user?.id).length}
              </div>
              <div className="text-sm font-medium text-success-700 dark:text-success-300">Your Articles</div>
              <div className="text-xs text-success-600/70 dark:text-success-400/70 mt-1">Your contributions</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {allTags.length}
              </div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Unique Tags</div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Content categories</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {articles.filter(a => a.summary).length}
              </div>
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">With Summary</div>
              <div className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Enhanced articles</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard