import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminOnly } from './RoleBasedComponent'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Plus, 
  FileText,
  Moon,
  Sun
} from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAdmin, hasRole } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <nav className="glass border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
          >
            📚 ArticleHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/dashboard" 
              className="nav-link"
            >
              <FileText size={20} />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/articles/create" 
              className="nav-link"
            >
              <Plus size={20} />
              <span>Create Article</span>
            </Link>



            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              {isDark ? <Sun size={20} className="animate-pulse-glow" /> : <Moon size={20} className="animate-bounce-gentle" />}
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                  {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.name || user?.email}
                  </div>
                  <div className="flex items-center space-x-1">
                    {isAdmin ? (
                      <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-error-500 to-error-600 text-white rounded-full font-medium">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-success-500 to-success-600 text-white rounded-full font-medium">
                        User
                      </span>
                    )}
                  </div>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-3 w-56 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 animate-scale-in">
                <div className="py-3">
                  <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-600/50">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center space-x-2 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 backdrop-blur-sm"
          >
            <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="glass rounded-xl mx-4 p-4 space-y-2">
              <Link 
                to="/dashboard" 
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                <FileText size={20} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/articles/create" 
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                <Plus size={20} />
                <span>Create Article</span>
              </Link>
              

              
              <button
                onClick={toggleTheme}
                className="nav-link w-full"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              
              <div className="border-t border-slate-200/50 dark:border-slate-600/50 pt-3 mt-3">
                <div className="px-3 py-2 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-medium">
                      {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user?.name || user?.email}
                      </div>
                      <div className="mt-1">
                        {isAdmin ? (
                          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-error-500 to-error-600 text-white rounded-full font-medium">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-success-500 to-success-600 text-white rounded-full font-medium">
                            User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="nav-link w-full text-error-600 dark:text-error-400"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar