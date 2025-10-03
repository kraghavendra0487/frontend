import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmployeeSidebar from '../../components/EmployeeSidebar'
import UserCard from '../../components/employee/UserCard'
import ClaimsTable from '../../components/employee/ClaimsTable'
import CardForm from '../../components/employee/CardForm'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'

export default function EmployeeCustomersPage() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWorkType, setFilterWorkType] = useState('all')
  const [showClaimsModal, setShowClaimsModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null)
  const [claims, setClaims] = useState([])
  const [customerCardMap, setCustomerCardMap] = useState({})
  const [customerHasCard, setCustomerHasCard] = useState({})
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [selectedCustomerForCard, setSelectedCustomerForCard] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Add Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    customer_name: '',
    phone_number: '',
    type_of_work: '',
    discussed_amount: '',
    paid_amount: '',
    pending_amount: '',
    mode_of_payment: '',
    created_by: user?.id ? String(user.id) : ''
  })

  // Edit Customer Form State
  const [editCustomer, setEditCustomer] = useState({
    customer_name: '',
    phone_number: '',
    type_of_work: '',
    discussed_amount: '',
    paid_amount: '',
    pending_amount: '',
    mode_of_payment: '',
    created_by: user?.id ? String(user.id) : ''
  })

  useEffect(() => {
    if (!user) {
      return
    }
    if (user.role !== 'employee') {
      navigate('/admin/dashboard', { replace: true })
      return
    }
    setNewCustomer((prev) => ({ ...prev, created_by: String(user.id) }))
    setEditCustomer((prev) => ({ ...prev, created_by: String(user.id) }))
    fetchCustomers()
    setLoading(false)
  }, [user, navigate])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/employee/${user.id}`, {
        headers: getAuthHeaders()
      })

        const data = await response.json()
      const customers = Array.isArray(data) ? data : (data.customers || [])
      setCustomers(customers)
      
      // Check which customers have cards
      const cardStatus = {}
      for (const customer of customers) {
        cardStatus[customer.id] = await checkIfCustomerHasCard(customer.id)
      }
      setCustomerHasCard(cardStatus)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customers')
    }
  }

  const handleViewClaims = async (customer) => {
    try {
      setSelectedCustomerForView(customer)
      
      // Check if we already have the card cached
      if (customerCardMap[customer.id]) {
        setSelectedCard(customerCardMap[customer.id])
        await fetchClaims(customerCardMap[customer.id].id)
        setShowClaimsModal(true)
        return
      }

      // Fetch card for this customer
      const response = await fetch(`${API_BASE_URL}/api/cards/customer/${customer.id}`, {
        headers: getAuthHeaders()
      })

          if (response.ok) {
            const cardData = await response.json()
        let card = null
        
        // Handle different API response shapes
        if (cardData && typeof cardData === 'object') {
            if (cardData.card) {
            card = cardData.card
          } else if (cardData.cards && Array.isArray(cardData.cards) && cardData.cards.length > 0) {
            card = cardData.cards[0]
          } else if (cardData.id) {
            card = cardData
          }
        }

        // Cache the card
        setCustomerCardMap(prev => ({ ...prev, [customer.id]: card }))
        setSelectedCard(card)

        if (card) {
          await fetchClaims(card.id)
        } else {
          setClaims([])
        }
        
        setShowClaimsModal(true)
      } else {
        setSelectedCard(null)
        setClaims([])
        setShowClaimsModal(true)
      }
    } catch (error) {
      console.error('Error fetching customer card:', error)
      setSelectedCard(null)
      setClaims([])
      setShowClaimsModal(true)
    }
  }

  const handleAddCard = (customer) => {
    setSelectedCustomerForCard(customer)
    setShowAddCardModal(true)
  }

  const handleCardCreated = () => {
    setShowAddCardModal(false)
    setSelectedCustomerForCard(null)
    // Refresh customers and card status
    fetchCustomers()
  }

  const checkIfCustomerHasCard = async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/customer/${customerId}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const cardData = await response.json()
        return !!(cardData && (cardData.card || cardData.id || (cardData.cards && cardData.cards.length > 0)))
      }
      return false
    } catch (error) {
      return false
    }
  }

  const fetchClaims = async (cardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/claims/card/${cardId}`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const claimsData = await response.json()
        let claimsList = []
        
        if (claimsData && typeof claimsData === 'object') {
          if (Array.isArray(claimsData)) {
            claimsList = claimsData
          } else if (claimsData.claims && Array.isArray(claimsData.claims)) {
            claimsList = claimsData.claims
          } else if (claimsData.claim) {
            claimsList = [claimsData.claim]
          }
        }
        
        setClaims(claimsList)
      } else {
      setClaims([])
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
      setClaims([])
    }
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowCustomerDetails(true)
  }

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setEditCustomer({
      customer_name: customer.customer_name || '',
      phone_number: customer.phone_number || '',
      type_of_work: customer.type_of_work || '',
      discussed_amount: customer.discussed_amount || '',
      paid_amount: customer.paid_amount || '',
      pending_amount: customer.pending_amount || '',
      mode_of_payment: customer.mode_of_payment || '',
      created_by: String(user.id)
    })
    setShowEditModal(true)
  }

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        setSuccess('Customer deleted successfully')
        fetchCustomers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete customer')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Error deleting customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(newCustomer)
      })

      if (response.ok) {
        setSuccess('Customer added successfully')
        setShowAddModal(false)
        setNewCustomer({
          customer_name: '',
          phone_number: '',
          type_of_work: '',
          discussed_amount: '',
          paid_amount: '',
          pending_amount: '',
          mode_of_payment: '',
          created_by: String(user.id)
        })
        fetchCustomers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to add customer')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Error adding customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleUpdateCustomer = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editCustomer)
      })

      if (response.ok) {
        setSuccess('Customer updated successfully')
        setShowEditModal(false)
    setEditingCustomer(null)
        fetchCustomers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update customer')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Error updating customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      const matchesSearch = !searchTerm || 
        customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number?.includes(searchTerm) ||
        customer.type_of_work?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesWorkType = filterWorkType === 'all' || customer.type_of_work === filterWorkType
      
      return matchesSearch && matchesWorkType
    })
  }

  const getWorkTypeOptions = () => {
    const workTypes = [...new Set(customers.map(customer => customer.type_of_work).filter(Boolean))]
    return workTypes
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount) => {
    return amount ? `₹${Number(amount).toLocaleString()}` : '₹0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => logout()

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex h-screen">
        {/* Employee Navbar */}
        <EmployeeSidebar 
          user={user} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            
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
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Customers</h1>
              </div>
            </div>
            
        {/* Header */}
            <div className="mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Customers</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage customers you've created</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                    Add Customer
                    </button>
                  </div>
                </div>
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
                <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
                <button onClick={() => setSuccess('')} className="ml-2 text-green-500 hover:text-green-700">×</button>
                    </div>
            )}

            {/* Filters */}
            <div className="mb-6">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Search
                    </label>
                <input
                  type="text"
                      placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                />
                  </div>

                  {/* Work Type Filter */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Work Type
                    </label>
                    <select
                      value={filterWorkType}
                      onChange={(e) => setFilterWorkType(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="all">All Work Types</option>
                      {getWorkTypeOptions().map((workType) => (
                        <option key={workType} value={workType}>
                          {workType}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-end">
                    <div className={`px-3 py-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getFilteredCustomers().length} customers found
                      </span>
                    </div>
                  </div>
                </div>
                  </div>
                </div>

            {/* Customers Table */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
              
              {/* Phone Layout - Single Column Cards */}
              <div className="block sm:hidden">
                <div className="p-4 space-y-4">
                  {getFilteredCustomers().map((customer) => (
                    <div key={customer.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {customer.customer_name}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {customer.phone_number || 'N/A'}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Created: {formatDate(customer.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.mode_of_payment === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {customer.mode_of_payment || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Work: {customer.type_of_work || 'N/A'}
                        </p>
                        <div className="flex justify-between text-xs mt-1">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            D: {formatAmount(customer.discussed_amount)}
                          </span>
                          <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            P: {formatAmount(customer.paid_amount)}
                          </span>
                          <span className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            Pending: {formatAmount(customer.pending_amount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {customerHasCard[customer.id] ? (
                          <button
                            onClick={() => handleViewClaims(customer)}
                            className="flex-1 px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50"
                          >
                            View
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddCard(customer)}
                            className="flex-1 px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-full hover:bg-green-50"
                          >
                            Add Card
                          </button>
                        )}
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="flex-1 px-3 py-1 text-xs font-medium text-yellow-600 border border-yellow-200 rounded-full hover:bg-yellow-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="flex-1 px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tablet Layout - Better Structured Cards */}
              <div className="hidden sm:block lg:hidden">
                <div className="p-4">
                  <div className="space-y-4">
                    {getFilteredCustomers().map((customer) => (
                      <div key={customer.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {customer.customer_name}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.mode_of_payment === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {customer.mode_of_payment || 'N/A'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {customer.phone_number || 'N/A'}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Created: {formatDate(customer.created_at)}
                                </p>
                              </div>
                              <div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  Work: {customer.type_of_work || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                D: {formatAmount(customer.discussed_amount)}
                              </span>
                              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                P: {formatAmount(customer.paid_amount)}
                              </span>
                              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                Pending: {formatAmount(customer.pending_amount)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            {customerHasCard[customer.id] ? (
                              <button
                                onClick={() => handleViewClaims(customer)}
                                className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50"
                              >
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddCard(customer)}
                                className="px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-full hover:bg-green-50"
                              >
                                Add Card
                              </button>
                            )}
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="px-3 py-1 text-xs font-medium text-yellow-600 border border-yellow-200 rounded-full hover:bg-yellow-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Full Table */}
              <div className="hidden lg:block">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Customer
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Contact
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Work Type
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Mode of Payment
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Amounts
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Cards & Claims
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                      {getFilteredCustomers().map((customer) => (
                        <tr key={customer.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {customer.customer_name}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Created: {formatDate(customer.created_at)}
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {customer.phone_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} break-words max-w-xs`}>
                              {customer.type_of_work || 'N/A'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {customer.mode_of_payment || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                D: {formatAmount(customer.discussed_amount)}
                              </div>
                              <div className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                P: {formatAmount(customer.paid_amount)}
                              </div>
                              <div className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                Pending: {formatAmount(customer.pending_amount)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {customerHasCard[customer.id] ? (
                              <button
                                onClick={() => handleViewClaims(customer)}
                                className="text-indigo-600 hover:text-indigo-900 mr-2 px-3 py-1 border border-indigo-200 rounded-full hover:bg-indigo-50"
                              >
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddCard(customer)}
                                className="text-green-600 hover:text-green-900 mr-2 px-3 py-1 border border-green-200 rounded-full hover:bg-green-50"
                              >
                                Add Card
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="text-yellow-600 hover:text-yellow-900 px-3 py-1 border border-yellow-200 rounded-full hover:bg-yellow-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-200 rounded-full hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
                    <form onSubmit={handleAddCustomer} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.customer_name}
                          onChange={(e) => setNewCustomer({...newCustomer, customer_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.phone_number}
                          onChange={(e) => setNewCustomer({...newCustomer, phone_number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type of Work</label>
                        <input
                          type="text"
                          required
                          value={newCustomer.type_of_work}
                          onChange={(e) => setNewCustomer({...newCustomer, type_of_work: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discussed</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newCustomer.discussed_amount}
                            onChange={(e) => {
                              const discussed = parseFloat(e.target.value) || 0
                              const paid = parseFloat(newCustomer.paid_amount) || 0
                              const pending = Math.max(0, discussed - paid)
                              setNewCustomer({
                                ...newCustomer, 
                                discussed_amount: e.target.value,
                                pending_amount: pending.toString()
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Paid</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newCustomer.paid_amount}
                            onChange={(e) => {
                              const discussed = parseFloat(newCustomer.discussed_amount) || 0
                              const paid = parseFloat(e.target.value) || 0
                              const pending = Math.max(0, discussed - paid)
                              setNewCustomer({
                                ...newCustomer, 
                                paid_amount: e.target.value,
                                pending_amount: pending.toString()
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pending (Auto)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newCustomer.pending_amount}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
                        <select
                          value={newCustomer.mode_of_payment}
                          onChange={(e) => setNewCustomer({...newCustomer, mode_of_payment: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select payment mode</option>
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                                  <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Add Customer
                                    </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && editingCustomer && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Customer</h3>
                    <form onSubmit={handleUpdateCustomer} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          required
                          value={editCustomer.customer_name}
                          onChange={(e) => setEditCustomer({...editCustomer, customer_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editCustomer.phone_number}
                          onChange={(e) => setEditCustomer({...editCustomer, phone_number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type of Work</label>
                        <input
                          type="text"
                          required
                          value={editCustomer.type_of_work}
                          onChange={(e) => setEditCustomer({...editCustomer, type_of_work: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
            </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discussed</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editCustomer.discussed_amount}
                            onChange={(e) => {
                              const discussed = parseFloat(e.target.value) || 0
                              const paid = parseFloat(editCustomer.paid_amount) || 0
                              const pending = Math.max(0, discussed - paid)
                              setEditCustomer({
                                ...editCustomer, 
                                discussed_amount: e.target.value,
                                pending_amount: pending.toString()
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
      </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Paid</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editCustomer.paid_amount}
                            onChange={(e) => {
                              const discussed = parseFloat(editCustomer.discussed_amount) || 0
                              const paid = parseFloat(e.target.value) || 0
                              const pending = Math.max(0, discussed - paid)
                              setEditCustomer({
                                ...editCustomer, 
                                paid_amount: e.target.value,
                                pending_amount: pending.toString()
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pending (Auto)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editCustomer.pending_amount}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
                        <select
                          value={editCustomer.mode_of_payment}
                          onChange={(e) => setEditCustomer({...editCustomer, mode_of_payment: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select payment mode</option>
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                        </select>
              </div>
                      <div className="flex justify-end space-x-3 pt-4">
              <button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Update Customer
              </button>
                      </div>
                    </form>
            </div>
          </div>
        </div>
      )}

            {/* Customer Details Modal */}
            {showCustomerDetails && selectedCustomer && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
                      <button
                        onClick={() => setShowCustomerDetails(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-600">{selectedCustomer.customer_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-600">{selectedCustomer.phone_number}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Work Type:</span>
                        <span className="ml-2 text-gray-600">{selectedCustomer.type_of_work}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mode of Payment:</span>
                        <span className="ml-2 text-gray-600">{selectedCustomer.mode_of_payment}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Discussed Amount:</span>
                        <span className="ml-2 text-gray-600">{formatAmount(selectedCustomer.discussed_amount)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Paid Amount:</span>
                        <span className="ml-2 text-green-600">{formatAmount(selectedCustomer.paid_amount)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Pending Amount:</span>
                        <span className="ml-2 text-red-600">{formatAmount(selectedCustomer.pending_amount)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <span className="ml-2 text-gray-600">{formatDate(selectedCustomer.created_at)}</span>
                      </div>
                    </div>
                  </div>
          </div>
        </div>
      )}

            {/* Claims Modal */}
            {showClaimsModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-10 mx-auto p-5 border shadow-lg rounded-md bg-white" style={{ width: '90%', maxWidth: '1200px' }}>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Cards & Claims - {selectedCustomerForView?.customer_name}
                      </h3>
                      <button
                        onClick={() => setShowClaimsModal(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    {selectedCard ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <UserCard
                            cardNumber={selectedCard.card_number}
                            registerNumber={selectedCard.register_number}
                            cardHolderName={selectedCard.card_holder_name}
                            agentName={selectedCard.agent_name}
                            agentMobile={selectedCard.agent_mobile}
                            createdDate={selectedCard.created_at ? new Date(selectedCard.created_at).toLocaleDateString() : 'N/A'}
                          />
                        </div>
                        <ClaimsTable 
          card={selectedCard}
                          claims={claims} 
                          cardId={selectedCard.id}
                          onRefresh={() => fetchClaims(selectedCard.id)}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No card found for this customer.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add Card Modal */}
            {showAddCardModal && selectedCustomerForCard && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-10 mx-auto p-5 border shadow-lg rounded-md bg-white" style={{ width: '90%', maxWidth: '800px' }}>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Add Card for {selectedCustomerForCard.customer_name}
                      </h3>
                      <button
                        onClick={() => setShowAddCardModal(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <CardForm
                      customerId={selectedCustomerForCard.id}
                      customerName={selectedCustomerForCard.customer_name}
                      onSuccess={handleCardCreated}
                      onCancel={() => setShowAddCardModal(false)}
                      disableAnimations={true}
                    />
                  </div>
          </div>
        </div>
      )}

          </div>
        </main>
      </div>
    </div>
  )
}
