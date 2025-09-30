import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import EmployeeSidebar from '../../components/EmployeeSidebar'
import API_BASE_URL from '../../config/api'

export default function AddCustomer() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    type_of_work: '',
    discussed_amount: '',
    paid_amount: '',
    pending_amount: '',
    mode_of_payment: 'cash'
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // User data is now managed by AuthContext
    setLoading(false)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // Auto-calculate pending amount
      if (name === 'discussed_amount' || name === 'paid_amount') {
        const discussed = parseFloat(newData.discussed_amount) || 0
        const paid = parseFloat(newData.paid_amount) || 0
        const pending = Math.max(0, discussed - paid)
        newData.pending_amount = pending.toString()
      }
      
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validate required fields
    if (!formData.customer_name || !formData.phone_number || !formData.type_of_work || !formData.discussed_amount) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    // Validate amounts
    const discussedAmount = parseFloat(formData.discussed_amount)
    const paidAmount = parseFloat(formData.paid_amount) || 0
    const pendingAmount = parseFloat(formData.pending_amount) || 0

    if (discussedAmount <= 0) {
      setError('Discussed amount must be greater than 0')
      setSubmitting(false)
      return
    }

    if (paidAmount < 0) {
      setError('Paid amount cannot be negative')
      setSubmitting(false)
      return
    }

    if (pendingAmount < 0) {
      setError('Pending amount cannot be negative')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          phone_number: formData.phone_number,
          type_of_work: formData.type_of_work,
          discussed_amount: discussedAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          mode_of_payment: formData.mode_of_payment,
          created_by: user.id
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect back to employee dashboard
        navigate('/employee')
      } else {
        setError(data.error || 'Failed to add customer')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Employee Navbar */}
        <EmployeeSidebar
          user={user}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onLogout={logout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
            
            {/* Mobile Header with Hamburger Menu */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="text-right">
                <h1 className="text-lg font-bold text-gray-800">Add Customer</h1>
              </div>
            </div>
            
            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Customer</h1>
                    <p className="text-sm text-gray-600 mt-1">Create a new customer profile and manage their information</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Registration Form</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="type_of_work" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Work *
              </label>
              <textarea
                id="type_of_work"
                name="type_of_work"
                value={formData.type_of_work}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe the type of work"
              />
            </div>

            <div>
              <label htmlFor="discussed_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Discussed Amount (₹) *
              </label>
              <input
                type="number"
                id="discussed_amount"
                name="discussed_amount"
                value={formData.discussed_amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter discussed amount"
              />
            </div>

            <div>
              <label htmlFor="paid_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Paid Amount (₹)
              </label>
              <input
                type="number"
                id="paid_amount"
                name="paid_amount"
                value={formData.paid_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter paid amount"
              />
            </div>

            <div>
              <label htmlFor="pending_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Pending Amount (₹) - Auto Calculated
              </label>
              <input
                type="number"
                id="pending_amount"
                name="pending_amount"
                value={formData.pending_amount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Auto-calculated: Discussed - Paid"
              />
              <p className="text-xs text-gray-500 mt-1">Formula: Discussed Amount - Paid Amount = Pending Amount</p>
            </div>

            <div>
              <label htmlFor="mode_of_payment" className="block text-sm font-medium text-gray-700 mb-1">
                Mode of Payment *
              </label>
              <select
                id="mode_of_payment"
                name="mode_of_payment"
                value={formData.mode_of_payment}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#fcb72d' }}
              >
                {submitting ? 'Adding Customer...' : 'Add Customer'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/employee')}
                className="flex-1 px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            </form>
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}
