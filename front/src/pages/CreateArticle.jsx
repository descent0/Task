import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { articleAPI } from '../services/api'
import MarkdownEditor from '../components/MarkdownEditor'
import { ArrowLeft, Plus, X, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const CreateArticle = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      tags: [{ value: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags'
  })

  const watchedContent = watch('content')
  const watchedTitle = watch('title')

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

      const response = await articleAPI.create(articleData)
      const createdArticle = response.data.article || response.data
      
      toast.success('Article created successfully!')
      navigate(`/articles/${createdArticle._id}`)
    } catch (error) {
      console.error('Failed to create article:', error)
      toast.error(error.response?.data?.message || 'Failed to create article')
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

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Article
          </h1>
          
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
                    placeholder="Write your article content here...

Tip: Select text and click toolbar buttons to format, or use keyboard shortcuts:
- **bold text** (Ctrl+B)  
- *italic text* (Ctrl+I)
- # Heading 1
- ## Heading 2
- [link text](url)
- > quote text

Click the Preview button (👁️) to see formatted output!"
                    rows={15}
                    showPreview={false}
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
                to="/dashboard"
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
                {isLoading ? 'Creating...' : 'Create Article'}
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

      {/* Tips */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
          Writing Tips
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <li>• Use clear, descriptive titles that reflect your article's content</li>
          <li>• Add relevant tags to make your article easier to find</li>
          <li>• You can use Markdown for formatting (headers, links, lists, etc.)</li>
          <li>• Use the Preview mode to see how your article will look</li>
          <li>• After creating, you can generate an AI summary using Google Gemini</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateArticle