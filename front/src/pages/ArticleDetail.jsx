import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { articleAPI } from '../services/api'
import ReactMarkdown from 'react-markdown'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Edit, 
  Trash2, 
  Sparkles,
  Copy,
  ExternalLink,
  Download
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const ArticleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summarizing, setSummarizing] = useState(false)
  const [llmProvider, setLlmProvider] = useState('gemini')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchArticle()
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await articleAPI.getById(id)
      setArticle(response.data.article || response.data)
    } catch (error) {
      console.error('Failed to fetch article:', error)
      toast.error('Failed to load article')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    try {
      setSummarizing(true)
      const response = await articleAPI.summarize(id, llmProvider)
      const updatedArticle = response.data.article || response.data
      setArticle(updatedArticle)
      toast.success(`Article summarized using ${llmProvider.toUpperCase()}!`)
    } catch (error) {
      console.error('Failed to summarize article:', error)
      toast.error('Failed to generate summary')
    } finally {
      setSummarizing(false)
    }
  }

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error('Only admins can delete articles')
      return
    }

    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await articleAPI.delete(id)
        toast.success('Article deleted successfully')
        navigate('/dashboard')
      } catch (error) {
        console.error('Failed to delete article:', error)
        toast.error('Failed to delete article')
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleExportPDF = async () => {
    try {
      setExporting(true)
      const response = await articleAPI.exportPDF(id)
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename
      const title = article.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)
      const date = new Date().toISOString().split('T')[0]
      link.download = `article_${title}_${date}.pdf`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF exported successfully!')
    } catch (error) {
      console.error('Failed to export PDF:', error)
      toast.error('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <LoadingSpinner text="Loading article..." />
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Article not found
        </h2>
        <Link to="/dashboard" className="btn-primary">
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const canEdit = isAdmin || article.createdBy?._id === user?.id

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                Created: {formatDate(article.createdAt)}
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                By: {article.createdBy?.name || article.createdBy?.email || 'Unknown'}
              </div>
              {article.updatedAt !== article.createdAt && (
                <div className="flex items-center">
                  <Edit size={16} className="mr-2" />
                  Updated: {formatDate(article.updatedAt)}
                </div>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                  >
                    <Tag size={14} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="btn btn-secondary px-4 py-2"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Download size={16} className="mr-2" />
              )}
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            

            
            {canEdit && (
              <Link
                to={`/articles/${id}/edit`}
                className="btn btn-secondary px-4 py-2"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
            )}
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="btn-danger px-4 py-2"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {article.summary ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center">
              <Sparkles size={20} className="mr-2" />
              AI Summary
            </h2>
            <button
              onClick={() => copyToClipboard(article.summary)}
              className="btn btn-secondary text-sm px-3 py-1"
            >
              <Copy size={14} className="mr-1" />
              Copy
            </button>
          </div>
          <div className="text-blue-800 dark:text-blue-200 prose prose-blue max-w-none">
            <ReactMarkdown>{article.summary}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No summary yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate an AI summary of this article using Google Gemini.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="input text-sm"
                disabled={summarizing}
              >
                <option value="gemini">Google Gemini</option>
              </select>
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="btn-primary px-4 py-2"
              >
                <Sparkles size={16} className="mr-2" />
                {summarizing ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4 mt-8" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-3 mt-6" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-7" {...props} />,
              ul: ({node, ...props}) => <ul className="mb-4 ml-6 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="mb-4 ml-6 space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="leading-7" {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 italic my-6" {...props} />
              ),
              code: ({node, inline, ...props}) => 
                inline ? (
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm" {...props} />
                ) : (
                  <code className="block bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto" {...props} />
                ),
              a: ({node, ...props}) => (
                <a className="text-primary-600 hover:text-primary-700 inline-flex items-center" {...props}>
                  {props.children}
                  <ExternalLink size={14} className="ml-1" />
                </a>
              )
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Article Actions */}
      <div className="mt-8 flex justify-between items-center">
        <Link 
          to="/dashboard"
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex gap-3">
          <button
            onClick={() => copyToClipboard(article.content)}
            className="btn btn-secondary"
          >
            <Copy size={16} className="mr-2" />
            Copy Content
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="btn btn-secondary"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          
          {canEdit && (
            <Link
              to={`/articles/${id}/edit`}
              className="btn-primary"
            >
              <Edit size={16} className="mr-2" />
              Edit Article
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticleDetail