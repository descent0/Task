import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { articleAPI } from '../services/api'
import MarkdownEditor from '../components/MarkdownEditor'
import { ArrowLeft, Plus, X, Save, Eye } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const EditArticle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      tags: [{ value: '' }]
    }
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'tags'
  })

  const watchedContent = watch('content')
  const watchedTitle = watch('title')

  useEffect(() => {
    fetchArticle()
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await articleAPI.getById(id)
      const articleData = response.data.article || response.data
      
      // Check if user can edit this article
      if (!isAdmin && articleData.createdBy?._id !== user?.id) {
        toast.error('You can only edit your own articles')
        navigate('/dashboard')
        return
      }
      
      setArticle(articleData)
      
      // Populate form with existing data
      setValue('title', articleData.title)
      setValue('content', articleData.content)
      
      // Handle tags
      const tagObjects = articleData.tags?.length > 0 
        ? articleData.tags.map(tag => ({ value: tag }))
        : [{ value: '' }]
      replace(tagObjects)
      
    } catch (error) {
      console.error('Failed to fetch article:', error)
      toast.error('Failed to load article')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Filter out empty tags
      const tags = data.tags
        .map(tag => tag.value.trim())
        .filter(tag => tag !== '')

      const articleData = {
        title: data.title.trim(),
        content: data.content.trim(),
        tags: tags
      }

      const response = await articleAPI.update(id, articleData)
      const updatedArticle = response.data.article || response.data
      
      toast.success('Article updated successfully!')
      navigate(`/articles/${updatedArticle._id}`)
    } catch (error) {
      console.error('Failed to update article:', error)
      toast.error(error.response?.data?.message || 'Failed to update article')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    append({ value: '' })
  }

  const removeTag = (index) => {
    if (fields.length > 1) {
      remove(index)
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={`/articles/${id}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Article
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Article
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Created: {formatDate(article.createdAt)}</p>
              {article.updatedAt !== article.createdAt && (
                <p>Last updated: {formatDate(article.updatedAt)}</p>
              )}
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="btn btn-secondary"
          >
            <Eye size={16} className="mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {!previewMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Article Title *
              </label>
              <input
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Title must be less than 200 characters'
                  }
                })}
                type="text"
                className="input"
                placeholder="Enter article title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`tags.${index}.value`)}
                      type="text"
                      className="input flex-1"
                      placeholder="Enter a tag..."
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      disabled={fields.length === 1}
                      className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTag}
                className="mt-2 btn btn-secondary text-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Tag
              </button>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add relevant tags to help categorize your article
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Article Content *
              </label>
              <Controller
                name="content"
                control={control}
                rules={{
                  required: 'Content is required',
                  minLength: {
                    value: 50,
                    message: 'Content must be at least 50 characters'
                  }
                }}
                render={({ field }) => (
                  <MarkdownEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your article content here... You can use Markdown formatting!"
                    rows={15}
                    showPreview={previewMode}
                  />
                )}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>



            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={`/articles/${id}`}
                className="btn btn-secondary"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                <Save size={16} className="mr-2" />
                {isLoading ? 'Updating...' : 'Update Article'}
              </button>
            </div>
          </form>
        ) : (
          // Preview Mode
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {watchedTitle || 'Untitled Article'}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Preview Mode - Click "Edit" to continue editing
              </div>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {watchedContent ? (
                <div className="whitespace-pre-wrap">
                  {watchedContent}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No content yet. Switch to edit mode to add content.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Info */}
      {article.summary && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            Current AI Summary
          </h3>
          <div className="text-blue-800 dark:text-blue-200 text-sm prose prose-blue max-w-none">
            <p>{article.summary}</p>
          </div>
          <p className="mt-3 text-blue-700 dark:text-blue-300 text-sm">
            Note: The summary will remain unchanged unless you regenerate it from the article view page.
          </p>
        </div>
      )}
    </div>
  )
}

export default EditArticle