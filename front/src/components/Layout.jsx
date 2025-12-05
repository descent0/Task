import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout