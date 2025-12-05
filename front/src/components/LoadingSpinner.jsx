import React from 'react'

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-6 animate-fade-in">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-secondary-200 dark:border-secondary-700 rounded-full animate-spin`}></div>
        {/* Inner gradient ring */}
        <div className={`${sizeClasses[size]} absolute top-0 left-0 border-4 border-transparent border-t-primary-600 border-r-primary-500 rounded-full animate-spin`} style={{ animationDuration: '1s' }}></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
      </div>
      {text && (
        <div className="text-center space-y-2">
          <p className="text-secondary-600 dark:text-secondary-400 font-medium">{text}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner