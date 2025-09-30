import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import UserCard from '../../components/employee/UserCard'
import AdminClaimsTable from '../../components/admin/AdminClaimsTable'
import EditCardModal from '../../components/admin/EditCardModal'
import WhiteCardPopup from '../../components/WhiteCardPopup'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'

export default function CustomerManagement() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [filterWorkType, setFilterWorkType] = useState('all')
  const [showClaimsModal, setShowClaimsModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null)
  const [showCardEditModal, setShowCardEditModal] = useState(false)
  const [cardBeingEdited, setCardBeingEdited] = useState(null)
  const [claims, setClaims] = useState([])
  const [customerCardMap, setCustomerCardMap] = useState({})
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
    if (user.role !== 'admin') {
      navigate('/employee', { replace: true })
      return
    }
    setNewCustomer((prev) => ({ ...prev, created_by: String(user.id) }))
    setEditCustomer((prev) => ({ ...prev, created_by: String(user.id) }))
    Promise.all([fetchCustomers(), fetchEmployees()]).finally(() => setLoading(false))
  }, [user, navigate])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()
      const customers = Array.isArray(data) ? data : (data.customers || [])
      setCustomers(customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customers')
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/employees`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()
      const employees = Array.isArray(data) ? data : (data.users || data.employees || [])
      setEmployees(employees)
    } catch (error) {
      console.error('Error fetching employees:', error)
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
      created_by: customer.created_by || ''
    })
    setShowEditModal(true)
  }

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
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
      console.error('Error deleting customer:', error)
      setError('Failed to delete customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...newCustomer,
          mode_of_payment: newCustomer.mode_of_payment || null,
          created_by: user?.id ?? (newCustomer.created_by ? parseInt(newCustomer.created_by, 10) : null)
        })
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
          created_by: user?.id || ''
        })
        fetchCustomers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add customer')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      setError('Failed to add customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleUpdateCustomer = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...editCustomer,
          mode_of_payment: editCustomer.mode_of_payment || null,
          created_by: user?.id ?? (editCustomer.created_by ? parseInt(editCustomer.created_by, 10) : null)
        })
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
      console.error('Error updating customer:', error)
      setError('Failed to update customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getFilteredCustomers = () => {
    let filtered = customers

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(customer =>
        customer.customer_name?.toLowerCase().includes(term) ||
        customer.phone_number?.includes(searchTerm) ||
        customer.type_of_work?.toLowerCase().includes(term) ||
        employees.find(emp => emp.id === parseInt(customer.created_by))?.name?.toLowerCase().includes(term)
      )
    }

    // Employee filter
    if (filterEmployee !== 'all') {
      filtered = filtered.filter(customer => customer.assigned_to === filterEmployee)
    }

    // Work type filter
    if (filterWorkType !== 'all') {
      filtered = filtered.filter(customer => customer.type_of_work === filterWorkType)
    }

    return filtered
  }

  // Card and Claims handlers
  const fetchCustomerCards = async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/customer/${customerId}`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        const cards = Array.isArray(data) ? data : (data.cards || (data.card ? [data.card] : []))
        setCustomerCardMap((prev) => ({ ...prev, [customerId]: cards }))
        return cards
      }
      return []
    } catch (error) {
      console.error('Error fetching customer cards:', error)
      setCustomerCardMap((prev) => ({ ...prev, [customerId]: [] }))
      return []
    }
  }

  const fetchClaims = async (cardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/claims/card/${cardId}`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        const claims = Array.isArray(data) ? data : (data.claims || (data.claim ? [data.claim] : []))
        setClaims(claims)
        return claims
      }
      return []
    } catch (error) {
      console.error('Error fetching claims:', error)
      return []
    }
  }

  const loadClaimsForCustomer = async (customer) => {
    if (!customer) return
    const existing = customerCardMap[customer.id]
    const cards = existing ? existing : await fetchCustomerCards(customer.id)
    if (cards.length > 0) {
      const cardToUse = cards[0]
      await fetchClaims(cardToUse.id)
      setSelectedCard(cardToUse)
    } else {
      setSelectedCard(null)
      setClaims([])
    }
  }

  const handleViewClaims = async (customer) => {
    setSelectedCustomerForView(customer)
    await loadClaimsForCustomer(customer)
    setShowClaimsModal(true)
  }

  const handleEditCardFromModal = (card) => {
    setCardBeingEdited(card)
    setShowCardEditModal(true)
  }

  const handleCardUpdate = async (updatedCard) => {
    if (!updatedCard) return
    setCustomerCardMap((prev) => ({ ...prev, [updatedCard.customer_id]: [updatedCard] }))
    setSelectedCard(updatedCard)
    if (selectedCustomerForView) {
      await loadClaimsForCustomer(selectedCustomerForView)
    }
  }

  const closeClaimsModal = () => {
    setShowClaimsModal(false)
    setSelectedCard(null)
    setSelectedCustomerForView(null)
    setClaims([])
  }

  const getWorkTypeOptions = () => {
    const workTypes = [...new Set(customers.map(customer => customer.type_of_work).filter(Boolean))]
    return workTypes
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
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Admin Navbar */}
        <AdminSidebar
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900`}>
            
            {/* Header */}
            <div className="mb-8">
              <div className={`bg-white rounded-lg shadow-sm p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-bold text-gray-800`}>Customer Management</h1>
                    <p className={`text-sm text-gray-600 mt-1`}>Manage all customers in the system</p>
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
              <div className={`bg-white rounded-lg shadow-sm p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                    />
                  </div>

                  {/* Employee Filter */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                      Employee
                    </label>
                    <select
                      value={filterEmployee}
                      onChange={(e) => setFilterEmployee(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                    >
                      <option value="all">All Employees</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Work Type Filter */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                      Work Type
                    </label>
                    <select
                      value={filterWorkType}
                      onChange={(e) => setFilterWorkType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
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
                    <div className={`px-3 py-2 bg-gray-50 rounded-lg`}>
                      <span className={`text-sm text-gray-600`}>
                        {getFilteredCustomers().length} customers found
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`bg-gray-50`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Customer
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        ID
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Contact
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Work Type
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Mode of Payment
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Amounts
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Created By
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Cards & Claims
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500`}>
                        Manage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredCustomers().map((customer) => (
                      <tr key={customer.id} className={`hover:bg-gray-50`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-200`}>
                              <span className={`text-sm font-medium text-gray-700`}>
                                {customer.customer_name?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium text-gray-900`}>
                                {customer.customer_name || 'N/A'}
                              </div>
                      <div className={`text-xs text-gray-500`}>
                        Added on {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                              </div>
                      {customerCardMap[customer.id]?.[0]?.card_holder_name && (
                        <div className="text-xs text-gray-500">
                          Card Holder: {customerCardMap[customer.id][0].card_holder_name}
                            </div>
                      )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm text-gray-900`}>
                            {customer.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm text-gray-900`}>
                            {customer.phone_number || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm text-gray-900`} style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
                            {customer.type_of_work || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm text-gray-900`}>
                            {customer.mode_of_payment || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm space-y-1">
                            <div className={`text-gray-900`}>
                              <span className="font-medium">Discussed:</span> ₹{customer.discussed_amount || 0}
                            </div>
                            <div className={`text-gray-500`}>
                              <span className="font-medium">Paid:</span> ₹{customer.paid_amount || 0}
                            </div>
                            <div className={`text-gray-500`}>
                              <span className="font-medium">Pending:</span> ₹{customer.pending_amount || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm text-gray-900`} style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
                            {customer.employee_name || 'Unassigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(() => {
                            const cards = customerCardMap[customer.id]
                            if (cards && cards.length === 0) {
                              return <span className={`text-gray-500 text-xs`}>No cards</span>
                            }
                            return (
                              <button
                                onClick={() => handleViewClaims(customer)}
                                className="text-orange-600 hover:text-orange-900 text-xs"
                              >
                                View
                              </button>
                            )
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCustomer(customer)}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 text-xs"
                              >
                                Delete
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {getFilteredCustomers().length === 0 && (
              <div className={`bg-white rounded-lg shadow-sm p-12 text-center`}>
                <div className="text-6xl mb-4">👤</div>
                <h3 className={`text-lg font-semibold text-gray-800 mb-2`}>
                  No customers found
                </h3>
                <p className={`text-gray-600`}>
                  {searchTerm || filterEmployee !== 'all' || filterWorkType !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No customers have been added yet.'
                  }
                </p>
              </div>
            )}

            {/* Add Customer Modal */}
            {showAddModal && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={() => setShowAddModal(false)}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ml-32`} onClick={(e) => e.stopPropagation()}>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-4`}>
                    Add New Customer
                  </h3>
                  <form onSubmit={handleAddCustomer} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={newCustomer.customer_name}
                        onChange={(e) => setNewCustomer({...newCustomer, customer_name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newCustomer.phone_number}
                        onChange={(e) => setNewCustomer({...newCustomer, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Type of Work
                      </label>
                      <select
                        value={newCustomer.type_of_work}
                        onChange={(e) => setNewCustomer({...newCustomer, type_of_work: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      >
                        <option value="">Select Work Type</option>
                        <option value="Interior">Interior</option>
                        <option value="Exterior">Exterior</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Mode of Payment
                      </label>
                      <select
                        value={newCustomer.mode_of_payment}
                        onChange={(e) => setNewCustomer({...newCustomer, mode_of_payment: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      >
                        <option value="">Select payment mode</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Discussed Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCustomer.discussed_amount}
                        onChange={(e) => setNewCustomer({...newCustomer, discussed_amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Pending Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCustomer.pending_amount}
                        onChange={(e) => setNewCustomer({...newCustomer, pending_amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Paid Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newCustomer.paid_amount}
                        onChange={(e) => setNewCustomer({...newCustomer, paid_amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Assign to Employee
                      </label>
                      <select
                        value={newCustomer.created_by}
                        onChange={(e) => setNewCustomer({...newCustomer, created_by: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Customer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && editingCustomer && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={() => setShowAddModal(false)}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ml-32`} onClick={(e) => e.stopPropagation()}>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-4`}>
                    Edit Customer
                  </h3>
                  <form onSubmit={handleUpdateCustomer} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={editCustomer.customer_name}
                        onChange={(e) => setEditCustomer({...editCustomer, customer_name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editCustomer.phone_number}
                        onChange={(e) => setEditCustomer({...editCustomer, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Type of Work
                      </label>
                      <select
                        value={editCustomer.type_of_work}
                        onChange={(e) => setEditCustomer({...editCustomer, type_of_work: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      >
                        <option value="">Select Work Type</option>
                        <option value="Interior">Interior</option>
                        <option value="Exterior">Exterior</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Mode of Payment
                      </label>
                      <select
                        value={editCustomer.mode_of_payment}
                        onChange={(e) => setEditCustomer({...editCustomer, mode_of_payment: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      >
                        <option value="">Select payment mode</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Discussed Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editCustomer.discussed_amount}
                        onChange={(e) => setEditCustomer({...editCustomer, discussed_amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Pending Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editCustomer.pending_amount}
                        onChange={(e) => setEditCustomer({...editCustomer, pending_amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Paid Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editCustomer.paid_amount}
                        onChange={(e) => setEditCustomer({...editCustomer, paid_amount: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Assign to Employee
                      </label>
                      <select
                        value={editCustomer.created_by}
                        onChange={(e) => setEditCustomer({...editCustomer, created_by: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Update Customer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Customer Details Modal */}
            {showCustomerDetails && selectedCustomer && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={() => setShowAddModal(false)}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg font-semibold text-gray-900`}>
                      Customer Details - {selectedCustomer.customer_name}
                    </h3>
                    <button
                      onClick={() => setShowCustomerDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className={`font-semibold text-gray-900 mb-4`}>Customer Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Name:</span> {selectedCustomer.customer_name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {selectedCustomer.phone_number || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Work Type:</span> {selectedCustomer.type_of_work || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Mode of Payment:</span> {selectedCustomer.mode_of_payment || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Created by:</span> {selectedCustomer.employee_name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-semibold text-gray-900 mb-4`}>Financial Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Discussed Amount:</span> ₹{selectedCustomer.discussed_amount || 0}
                        </div>
                        <div>
                          <span className="font-medium">Pending Amount:</span> ₹{selectedCustomer.pending_amount || 0}
                        </div>
                        <div>
                          <span className="font-medium">Paid Amount:</span> ₹{selectedCustomer.paid_amount || 0}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(selectedCustomer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Claims Modal */}
            {showClaimsModal && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={closeClaimsModal}>
                <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-6">
                    <AdminClaimsTable
                      claims={claims}
                      card={selectedCard}
                      onEditCard={(card) => handleEditCardFromModal(card)}
                    />
                  </div>
                </div>
              </div>
            )}

            {showCardEditModal && cardBeingEdited && (
              <EditCardModal
                card={cardBeingEdited}
                onClose={() => setShowCardEditModal(false)}
                onUpdated={(updatedCard) => {
                  handleCardUpdate(updatedCard)
                  setShowCardEditModal(false)
                }}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
