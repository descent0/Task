import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ArticleDetail from './pages/ArticleDetail'
import CreateArticle from './pages/CreateArticle'
import EditArticle from './pages/EditArticle'

import LoadingSpinner from './components/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="min-h-screen gradient-bg">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <div className="animate-fade-in">
              <Login />
            </div>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <div className="animate-fade-in">
              <Register />
            </div>
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <div className="animate-fade-in">
              <Layout />
            </div>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="articles/:id" element={<ArticleDetail />} />
          <Route path="articles/create" element={<CreateArticle />} />
          <Route path="articles/:id/edit" element={<EditArticle />} />

        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App