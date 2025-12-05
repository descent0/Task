import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login(data.email, data.password)
      
      if (result.success) {
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-scale-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Welcome Back!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to your ArticleHub account
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Create one now
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className="mt-1 input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-base font-semibold relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span>{isLoading ? 'Signing in...' : 'Sign In to ArticleHub'}</span>
              </span>
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 animate-pulse"></div>
              )}
            </button>
          </div>
         
          
        </form>
        </div>
      </div>
    </div>
  )
}

export default Login