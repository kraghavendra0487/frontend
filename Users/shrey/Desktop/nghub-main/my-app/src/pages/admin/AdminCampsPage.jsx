import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'
import RecentCampsMaps from '../../components/RecentCampsMaps'

export default function CampManagement() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [camps, setCamps] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedCamp, setSelectedCamp] = useState(null)
  const [showCampDetails, setShowCampDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCamp, setEditingCamp] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('')
  const navigate = useNavigate()

  const getFilteredEmployees = () => {
    if (!employeeSearchTerm) return employees
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    )
  }

  // Add Camp Form State
  const [newCamp, setNewCamp] = useState({
    camp_date: '',
    location: '',
    location_link: '',
    phone_number: '',
    status: 'planned',
    conducted_by: '',
    assigned_to: []
  })

  // Edit Camp Form State
  const [editCamp, setEditCamp] = useState({
    camp_date: '',
    location: '',
    location_link: '',
    phone_number: '',
    status: 'planned',
    conducted_by: '',
    assigned_to: []
  })

  useEffect(() => {
    if (!user) {
      return
    }
    if (user.role !== 'admin') {
      navigate('/employee', { replace: true })
      return
    }
    Promise.all([fetchCamps(), fetchEmployees()]).finally(() => setLoading(false))
  }, [user, navigate])

  const fetchCamps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/camps`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()
      const list = Array.isArray(data) ? data : (data.camps || [])
      setCamps(list)
    } catch (error) {
      console.error('Error fetching camps:', error)
      setError('Failed to fetch camps')
      setTimeout(() => setError(''), 3000)
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

  const handleViewCamp = (camp) => {
    setSelectedCamp(camp)
    setShowCampDetails(true)
  }

  const handleEditCamp = (camp) => {
    setEditingCamp(camp)
    // Ensure assigned_to is always an array
    const assignedToArray = Array.isArray(camp.assigned_to)
      ? camp.assigned_to
      : (camp.assigned_to ? [camp.assigned_to.toString()] : [])

    setEditCamp({
      camp_date: camp.camp_date,
      location: camp.location,
      location_link: camp.location_link || '',
      phone_number: camp.phone_number || '',
      status: camp.status,
      conducted_by: camp.conducted_by || '',
      assigned_to: assignedToArray
    })
    setShowEditModal(true)
  }

  const handleDeleteCamp = async (campId) => {
    if (!confirm('Are you sure you want to delete this camp?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/camps/${campId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        setSuccess('Camp deleted successfully')
        fetchCamps()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete camp')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting camp:', error)
      setError('Failed to delete camp')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleAddCamp = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/camps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newCamp)
      })

      if (response.ok) {
        setSuccess('Camp added successfully')
        setShowAddModal(false)
        setNewCamp({
          camp_date: '',
          location: '',
          location_link: '',
          phone_number: '',
          status: 'planned',
          conducted_by: '',
          assigned_to: []
        })
        fetchCamps()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add camp')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error adding camp:', error)
      setError('Failed to add camp')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleUpdateCamp = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/camps/${editingCamp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(editCamp)
      })

      if (response.ok) {
        setSuccess('Camp updated successfully')
        setShowEditModal(false)
        setEditingCamp(null)
        fetchCamps()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update camp')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error updating camp:', error)
      setError('Failed to update camp')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getFilteredCamps = () => {
    if (filterStatus === 'all') return camps
    return camps.filter(camp => camp.status === filterStatus)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
            
            {/* Header */}
            <div className="mb-8">
              <div className={`bg-white rounded-lg shadow-sm p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-bold text-gray-800`}>Camp Management</h1>
                    <p className={`text-sm text-gray-600 mt-1`}>Manage all camps in the system</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Camp
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

            {/* Filter Tabs */}
            <div className="mb-6">
              <div className={`bg-white rounded-lg shadow-sm p-4`}>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All ({camps.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('planned')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === 'planned'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Planned ({camps.filter(c => c.status === 'planned').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('ongoing')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === 'ongoing'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Ongoing ({camps.filter(c => c.status === 'ongoing').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === 'completed'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Completed ({camps.filter(c => c.status === 'completed').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('cancelled')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === 'cancelled'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancelled ({camps.filter(c => c.status === 'cancelled').length})
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className={`bg-white rounded-lg shadow-sm p-6`}>
                <RecentCampsMaps camps={camps} title="Recent Camps" onViewMore={() => navigate('/admin/camps')} />
              </div>
            </div>

            {/* Camps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredCamps().map((camp) => (
                <div key={camp.id} className={`bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                  {/* Map Section */}
                  <div className="relative">
                    <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(camp.location)}&z=15&output=embed`}
                        title="Google Map Preview"
                      />
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold text-gray-800 mb-1`}>
                          {camp.location}
                        </h4>
                        <p className={`text-sm text-gray-600`}>
                          {new Date(camp.camp_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(camp.status)}`}>
                        {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {camp.conducted_by && (
                        <div>
                          <p className={`text-xs font-medium text-gray-500 uppercase tracking-wide`}>
                            Conducted by
                          </p>
                          <p className={`text-sm text-gray-800`}>
                            {camp.conducted_by}
                          </p>
                        </div>
                      )}
                      
                      {camp.phone_number && (
                        <div>
                          <p className={`text-xs font-medium text-gray-500 uppercase tracking-wide`}>
                            Contact
                          </p>
                          <p className={`text-sm text-gray-800`}>
                            {camp.phone_number}
                          </p>
                        </div>
                      )}

                      {camp.assigned_to && (
                        <div>
                          <p className={`text-xs font-medium text-gray-500 uppercase tracking-wide`}>
                            Assigned to
                          </p>
                          <p className={`text-sm text-gray-800`}>
                            {employees.find(emp => emp.id === parseInt(camp.assigned_to))?.name || 'Unknown'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3">
                      <button
                        onClick={() => handleViewCamp(camp)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-blue-600 border border-blue-100 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditCamp(camp)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-emerald-600 border border-emerald-100 rounded-full hover:bg-emerald-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCamp(camp.id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-red-600 border border-red-100 rounded-full hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredCamps().length === 0 && (
              <div className={`bg-white rounded-lg shadow-sm p-12 text-center`}>
                <div className="text-6xl mb-4">🏕️</div>
                <h3 className={`text-lg font-semibold text-gray-800 mb-2`}>
                  No camps found
                </h3>
                <p className={`text-gray-600`}>
                  {filterStatus === 'all' 
                    ? 'No camps have been created yet.' 
                    : `No camps with status "${filterStatus}" found.`
                  }
                </p>
              </div>
            )}

            {/* Add Camp Modal */}
            {showAddModal && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={() => setShowAddModal(false)}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ml-32`} onClick={(e) => e.stopPropagation()}>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-4`}>
                    Add New Camp
                  </h3>
                  <form onSubmit={handleAddCamp} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Camp Date
                      </label>
                      <input
                        type="date"
                        value={newCamp.camp_date}
                        onChange={(e) => setNewCamp({...newCamp, camp_date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={newCamp.location}
                        onChange={(e) => setNewCamp({...newCamp, location: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Location Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={newCamp.location_link}
                        onChange={(e) => setNewCamp({...newCamp, location_link: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newCamp.phone_number}
                        onChange={(e) => setNewCamp({...newCamp, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Status
                      </label>
                      <select
                        value={newCamp.status}
                        onChange={(e) => setNewCamp({...newCamp, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      >
                        <option value="planned">Planned</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Conducted By
                      </label>
                      <input
                        type="text"
                        value={newCamp.conducted_by}
                        onChange={(e) => setNewCamp({...newCamp, conducted_by: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Assign Employees
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Search employees..."
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        />
                        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-white border-gray-300">
                          {getFilteredEmployees().map((employee) => (
                            <label key={employee.id} className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={newCamp.assigned_to.includes(employee.id.toString())}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewCamp({
                                      ...newCamp,
                                      assigned_to: [...newCamp.assigned_to, employee.id.toString()]
                                    })
                                  } else {
                                    setNewCamp({
                                      ...newCamp,
                                      assigned_to: newCamp.assigned_to.filter(id => id !== employee.id.toString())
                                    })
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium text-gray-700`}>
                                    {employee.name}
                                  </span>
                                  <span className={`text-xs text-gray-500`}>
                                    ({employee.employee_id})
                                  </span>
                                </div>
                                <span className={`text-xs text-gray-500`}>
                                  {employee.email}
                                </span>
                              </div>
                            </label>
                          ))}
                          {getFilteredEmployees().length === 0 && (
                            <p className={`text-sm text-center py-2 text-gray-500`}>
                              No employees found
                            </p>
                          )}
                        </div>
                        {newCamp.assigned_to.length > 0 && (
                          <p className="text-xs text-green-600">
                            {newCamp.assigned_to.length} employee(s) selected
                          </p>
                        )}
                      </div>
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
                        Add Camp
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Camp Modal */}
            {showEditModal && editingCamp && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={() => setShowAddModal(false)}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ml-32`} onClick={(e) => e.stopPropagation()}>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-4`}>
                    Edit Camp
                  </h3>
                  <form onSubmit={handleUpdateCamp} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Camp Date
                      </label>
                      <input
                        type="date"
                        value={editCamp.camp_date}
                        onChange={(e) => setEditCamp({...editCamp, camp_date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={editCamp.location}
                        onChange={(e) => setEditCamp({...editCamp, location: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Location Link
                      </label>
                      <input
                        type="url"
                        value={editCamp.location_link}
                        onChange={(e) => setEditCamp({...editCamp, location_link: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editCamp.phone_number}
                        onChange={(e) => setEditCamp({...editCamp, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Status
                      </label>
                      <select
                        value={editCamp.status}
                        onChange={(e) => setEditCamp({...editCamp, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      >
                        <option value="planned">Planned</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Conducted By
                      </label>
                      <input
                        type="text"
                        value={editCamp.conducted_by}
                        onChange={(e) => setEditCamp({...editCamp, conducted_by: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1`}>
                        Assign Employees
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Search employees..."
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                        />
                        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-white border-gray-300">
                          {getFilteredEmployees().map((employee) => (
                            <label key={employee.id} className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={editCamp.assigned_to.includes(employee.id.toString())}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditCamp({
                                      ...editCamp,
                                      assigned_to: [...editCamp.assigned_to, employee.id.toString()]
                                    })
                                  } else {
                                    setEditCamp({
                                      ...editCamp,
                                      assigned_to: editCamp.assigned_to.filter(id => id !== employee.id.toString())
                                    })
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium text-gray-700`}>
                                    {employee.name}
                                  </span>
                                  <span className={`text-xs text-gray-500`}>
                                    ({employee.employee_id})
                                  </span>
                                </div>
                                <span className={`text-xs text-gray-500`}>
                                  {employee.email}
                                </span>
                              </div>
                            </label>
                          ))}
                          {getFilteredEmployees().length === 0 && (
                            <p className={`text-sm text-center py-2 text-gray-500`}>
                              No employees found
                            </p>
                          )}
                        </div>
                        {editCamp.assigned_to.length > 0 && (
                          <p className="text-xs text-green-600">
                            {editCamp.assigned_to.length} employee(s) selected
                          </p>
                        )}
                      </div>
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
                        Update Camp
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Camp Details Modal */}
            {showCampDetails && selectedCamp && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}} onClick={() => setShowAddModal(false)}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg font-semibold text-gray-900`}>
                      Camp Details - {selectedCamp.location}
                    </h3>
                    <button
                      onClick={() => setShowCampDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`font-semibold text-gray-900 mb-4`}>Camp Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Location:</span> {selectedCamp.location}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(selectedCamp.camp_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCamp.status)}`}>
                            {selectedCamp.status.charAt(0).toUpperCase() + selectedCamp.status.slice(1)}
                          </span>
                        </div>
                        {selectedCamp.conducted_by && (
                          <div>
                            <span className="font-medium">Conducted by:</span> {selectedCamp.conducted_by}
                          </div>
                        )}
                        {selectedCamp.phone_number && (
                          <div>
                            <span className="font-medium">Contact:</span> {selectedCamp.phone_number}
                          </div>
                        )}
                        {selectedCamp.assigned_to && (
                          <div>
                            <span className="font-medium">Assigned to:</span> {employees.find(emp => emp.id === parseInt(selectedCamp.assigned_to))?.name || 'Unknown'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`font-semibold text-gray-900 mb-4`}>Location Map</h4>
                      <div className="w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedCamp.location)}&z=15&output=embed`}
                          title="Google Map Preview"
                        />
                      </div>
                    </div>
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
