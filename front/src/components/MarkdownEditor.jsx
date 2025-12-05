import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Eye, 
  EyeOff,
  Type,
  Hash,
  Image,
  Minus,
  Underline,
  Strikethrough
} from 'lucide-react'

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your content here...",
  className = "",
  rows = 15,
  showPreview = false 
}) => {
  const [previewMode, setPreviewMode] = useState(showPreview)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const textareaRef = useRef(null)
  const editorRef = useRef(null)

  // Sync with external showPreview prop
  useEffect(() => {
    setPreviewMode(showPreview)
  }, [showPreview])

  // Insert text at cursor position
  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const selectedText = value.substring(start, end)
    
    let textToInsert, newCursorStart, newCursorEnd
    
    if (selectedText) {
      // If text is selected, wrap it
      textToInsert = selectedText
      newCursorStart = start + before.length
      newCursorEnd = start + before.length + selectedText.length
    } else {
      // If no text selected, insert placeholder and select it
      textToInsert = placeholder
      newCursorStart = start + before.length
      newCursorEnd = start + before.length + placeholder.length
    }

    const newText = value.substring(0, start) + 
                   before + textToInsert + after + 
                   value.substring(end)
    
    onChange(newText)

    // Restore cursor position after state update
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus()
        if (selectedText) {
          // Position cursor after the formatting
          const cursorPos = start + before.length + textToInsert.length + after.length
          textarea.setSelectionRange(cursorPos, cursorPos)
        } else {
          // Select the placeholder text so user can immediately type over it
          textarea.setSelectionRange(newCursorStart, newCursorEnd)
        }
      }
    })
  }  // Insert text at new line
  const insertLine = (text) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart || 0
    const beforeCursor = value.substring(0, start)
    const afterCursor = value.substring(start)
    
    // Check if we're at the beginning of a line
    const isNewLine = beforeCursor === '' || beforeCursor.endsWith('\n')
    const prefix = isNewLine ? '' : '\n'
    
    const newText = beforeCursor + prefix + text + '\n' + afterCursor
    onChange(newText)

    // Set cursor position after inserted text
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus()
        const newPos = start + prefix.length + text.length + 1
        textarea.setSelectionRange(newPos, newPos)
      }
    })
  }

  // Toolbar buttons configuration
  const toolbarButtons = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => insertText('**', '**', 'bold text'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => insertText('*', '*', 'italic text'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Strikethrough,
      title: 'Strikethrough',
      action: () => insertText('~~', '~~', 'strikethrough text')
    },
    { type: 'separator' },
    {
      icon: Type,
      title: 'Heading 1',
      action: () => insertLine('# Heading 1')
    },
    {
      icon: Hash,
      title: 'Heading 2', 
      action: () => insertLine('## Heading 2')
    },
    { type: 'separator' },
    {
      icon: Link,
      title: 'Link',
      action: () => insertText('[', '](url)', 'link text')
    },
    {
      icon: Image,
      title: 'Image',
      action: () => insertText('![', '](image-url)', 'alt text')
    },
    { type: 'separator' },
    {
      icon: List,
      title: 'Bullet List',
      action: () => insertLine('- List item')
    },
    {
      icon: ListOrdered,
      title: 'Numbered List',
      action: () => insertLine('1. List item')
    },
    { type: 'separator' },
    {
      icon: Quote,
      title: 'Quote',
      action: () => insertLine('> Quote text')
    },
    {
      icon: Code,
      title: 'Inline Code',
      action: () => insertText('`', '`', 'code'),
    },
    {
      icon: Code,
      title: 'Code Block',
      action: () => insertLine('```\ncode here\n```')
    },
    {
      icon: Minus,
      title: 'Horizontal Rule',
      action: () => insertLine('---')
    }
  ]

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          e.stopPropagation()
          insertText('**', '**', 'bold text')
          break
        case 'i':
          e.preventDefault()
          e.stopPropagation()
          insertText('*', '*', 'italic text')
          break
        case 'k':
          e.preventDefault()
          e.stopPropagation()
          insertText('[', '](url)', 'link text')
          break
        case 'd':
          if (e.shiftKey) {
            e.preventDefault()
            e.stopPropagation()
            insertText('~~', '~~', 'strikethrough text')
          }
          break
        case '`':
          e.preventDefault()
          e.stopPropagation()
          insertText('`', '`', 'code')
          break
        default:
          break
      }
    }
    
    // Tab indentation
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      e.stopPropagation()
      insertText('  ')
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea && !isFullscreen) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(textarea.scrollHeight, rows * 24)}px`
    }
  }, [value, rows, isFullscreen])

  // Ensure textarea is focused when needed
  const focusTextarea = () => {
    const textarea = textareaRef.current
    if (textarea && !previewMode) {
      textarea.focus()
    }
  }

  // Debug function for testing
  const debugEditor = () => {
    console.log('Editor Debug Info:', {
      textareaRef: !!textareaRef.current,
      previewMode,
      value: value?.length,
      isFullscreen
    })
  }

  return (
    <div 
      ref={editorRef}
      className={`
        border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden backdrop-blur-sm
        ${isFullscreen ? 'fixed inset-4 z-50 glass shadow-2xl animate-scale-in' : 'card-hover'}
        ${className}
      `}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50/80 to-secondary-100/80 dark:from-secondary-800/80 dark:to-secondary-700/80 border-b border-secondary-200/50 dark:border-secondary-600/50 backdrop-blur-sm">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => (
            button.type === 'separator' ? (
              <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-2" />
            ) : (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  
                  // Ensure textarea has focus before action
                  const textarea = textareaRef.current
                  if (textarea) {
                    textarea.focus()
                    
                    // Small delay to ensure focus is set
                    setTimeout(() => {
                      button.action()
                    }, 10)
                  }
                  
                  // Brief visual feedback
                  const button_element = e.currentTarget
                  button_element.style.transform = 'scale(0.95)'
                  setTimeout(() => {
                    button_element.style.transform = 'scale(1)'
                  }, 100)
                }}
                title={`${button.title}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                className="p-2.5 rounded-lg hover:bg-secondary-200/50 dark:hover:bg-secondary-600/50 text-secondary-600 dark:text-secondary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:scale-110 active:scale-95"
              >
                <button.icon size={16} />
              </button>
            )
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setPreviewMode(!previewMode)
            }}
            className="p-2.5 rounded-lg hover:bg-secondary-200/50 dark:hover:bg-secondary-600/50 text-secondary-600 dark:text-secondary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:scale-110 active:scale-95"
            title={previewMode ? 'Show Editor' : 'Show Preview'}
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFullscreen()
            }}
            className="p-2.5 rounded-lg hover:bg-secondary-200/50 dark:hover:bg-secondary-600/50 text-secondary-600 dark:text-secondary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:scale-110 active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {isFullscreen ? (
                <path d="M2 8h2v2H2V8zm0 3h3v3H2v-3zm3-3h2v2H5V8zM2 5h3V2H2v3zm3 0h2V2H5v3zm0 3V6H4v2h1z"/>
              ) : (
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className={`flex ${isFullscreen ? 'h-full' : ''}`}>
        {!previewMode && (
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={isFullscreen ? 30 : rows}
              className={`
                w-full p-6 resize-none border-0 bg-transparent
                focus:outline-none focus:ring-0 
                font-mono text-sm leading-7
                text-secondary-900 dark:text-secondary-100
                placeholder-secondary-500 dark:placeholder-secondary-400
                transition-all duration-200
                ${isFullscreen ? 'h-full' : ''}
              `}
              style={{ minHeight: isFullscreen ? '100%' : `${rows * 24}px` }}
            />
          </div>
        )}
        
        {previewMode && (
          <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-white/50 to-secondary-50/30 dark:from-gray-900/50 dark:to-secondary-900/30">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {value ? (
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white" {...props} />,
                    h5: ({node, ...props}) => <h5 className="text-base font-medium mb-2 text-gray-900 dark:text-white" {...props} />,
                    h6: ({node, ...props}) => <h6 className="text-sm font-medium mb-2 text-gray-900 dark:text-white" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />,
                    ul: ({node, ...props}) => <ul className="mb-4 ml-6 space-y-2 list-disc" {...props} />,
                    ol: ({node, ...props}) => <ol className="mb-4 ml-6 space-y-2 list-decimal" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed text-gray-800 dark:text-gray-200" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary-500 pl-4 italic my-4 bg-gray-50 dark:bg-gray-800 py-2 text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    code: ({node, inline, ...props}) => 
                      inline ? (
                        <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                      ) : (
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto my-4 border">
                          <code className="text-gray-800 dark:text-gray-200 font-mono" {...props} />
                        </pre>
                      ),
                    a: ({node, ...props}) => (
                      <a className="text-primary-600 hover:text-primary-700 underline hover:no-underline" {...props} />
                    ),
                    img: ({node, ...props}) => (
                      <img className="max-w-full h-auto rounded-lg shadow-md my-4 border" {...props} />
                    ),
                    hr: ({node, ...props}) => (
                      <hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
                    ),
                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
                    del: ({node, ...props}) => <del className="line-through text-gray-600 dark:text-gray-400" {...props} />
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                  Nothing to preview yet. Start writing to see the formatted output.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-700/80 border-t border-slate-200/50 dark:border-slate-600/50 text-xs text-slate-500 dark:text-slate-400 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <span>{value.length} characters</span>
          <span>{value.split(/\s+/).filter(word => word.length > 0).length} words</span>
          <span>{value.split('\n').length} lines</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>📝 Markdown editor</span>
          {!previewMode && (
            <span>• Select text then click format buttons • Use 👁️ Preview to see formatted output • Ctrl+B bold • Ctrl+I italic</span>
          )}
          {previewMode && (
            <span>• Preview mode active - showing formatted output</span>
          )}
        </div>
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  )
}

export default MarkdownEditor