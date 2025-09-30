import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function EmployeeSidebar({ user, onLogout, isDarkMode, setIsDarkMode, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/employee',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      name: 'My Customers',
      path: '/employee/customers',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'My Camps',
      path: '/employee/camps',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ]

  const logout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Fallback: clear authentication data and redirect
      localStorage.removeItem('token')
      localStorage.removeItem('authUser')
      window.location.replace('/')
    }
  }

  const isActivePage = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img className="h-8 w-8" src="https://pub-8f7d5f81a3294be18dbe97ddb794a4ae.r2.dev/logo.png" alt="Logo" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">
                Employee Panel
              </h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = isActivePage(item.path)
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-inherit">
          {/* Profile Section */}
          <div
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 mb-3"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0).toUpperCase() || 'E'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">
                {user?.name || 'Employee'}
              </p>
              <p className="text-xs truncate text-gray-500">
                {user?.email || 'employee@example.com'}
              </p>
            </div>
          </div>

          {/* Logout */}
          <div className="flex items-center justify-end">
            <button
              onClick={logout}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

    </>
  )
}
