import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ user, onLogout }) => {
  const { logout } = useAuth()
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Auth App</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={() => onLogout ? onLogout() : logout()}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-gray-500">Please login to continue</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
