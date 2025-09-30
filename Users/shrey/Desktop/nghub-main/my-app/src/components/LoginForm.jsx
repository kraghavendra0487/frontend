import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword, handleApiError, showErrorToast, showSuccessToast } from '../utils/errorHandler'

const LoginForm = ({ onLogin, onForgotPassword }) => {
  const { login, loginInProgress } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form data
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting login with:', { email: formData.email })
      
      const result = await login(formData.email.trim(), formData.password)

      if (result.success) {
        showSuccessToast('Login successful!')
        // onLogin callback is optional, mainly for backward compatibility
        if (onLogin) {
          onLogin(result.user)
        }
      } else {
        const errorMessage = result.error || 'Login failed'
        setError(errorMessage)
        showErrorToast(errorMessage)
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = handleApiError(err, 'Login failed. Please try again.')
      setError(errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || loginInProgress}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
      >
        {(loading || loginInProgress) ? 'Logging in...' : 'Login'}
      </button>

      {onForgotPassword && (
        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            Forgot Password?
          </button>
        </div>
      )}
    </form>
  )
}

export default LoginForm
