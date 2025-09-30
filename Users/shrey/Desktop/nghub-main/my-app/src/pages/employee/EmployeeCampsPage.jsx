import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import EmployeeSidebar from '../../components/EmployeeSidebar'
import RecentCampsMaps from '../../components/RecentCampsMaps'

export default function CampsPage() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [camps, setCamps] = useState([])
  const [upcomingCamps, setUpcomingCamps] = useState([])
  const [ongoingCamps, setOngoingCamps] = useState([])
  const [completedCamps, setCompletedCamps] = useState([])
  const [cancelledCamps, setCancelledCamps] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('planned')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [employees, setEmployees] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCamp, setEditingCamp] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('')
  const navigate = useNavigate()

  // Add Camp Form State
  const [newCamp, setNewCamp] = useState({
    camp_date: '',
    location: '',
    location_link: '',
    phone_number: '',
    status: 'planned',
    conducted_by: '',
    assigned_to: [user?.id?.toString() || ''] // Default to current user
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

  const fetchCamps = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!user?.id) return
      const response = await fetch(`/api/camps/employee/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const campsData = data.camps || data || []
        setCamps(campsData)
        
        // Filter camps by status with null checks
        const upcoming = (campsData || []).filter(camp => camp && camp.status === 'planned')
        const ongoing = (campsData || []).filter(camp => camp && camp.status === 'ongoing')
        const completed = (campsData || []).filter(camp => camp && camp.status === 'completed')
        const cancelled = (campsData || []).filter(camp => camp && camp.status === 'cancelled')
        
        setUpcomingCamps(upcoming)
        setOngoingCamps(ongoing)
        setCompletedCamps(completed)
        setCancelledCamps(cancelled)
      } else {
        setError('Failed to fetch camps')
      }
    } catch (error) {
      console.error('Error fetching camps:', error)
      setError('Error fetching camps')
      // Set empty arrays to prevent filter errors
      setCamps([])
      setUpcomingCamps([])
      setOngoingCamps([])
      setCompletedCamps([])
      setCancelledCamps([])
    }
  }

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const employeesData = data.users || data.employees || data || []
        setEmployees(employeesData)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchCamps()
      fetchEmployees()
      // Set current user as default assigned employee
      setNewCamp(prev => ({ ...prev, assigned_to: [user.id.toString()] }))
    }
    setLoading(false)
  }, [user])


  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActiveTabData = () => {
    switch(activeTab) {
      case 'planned': return upcomingCamps
      case 'ongoing': return ongoingCamps
      case 'completed': return completedCamps
      case 'cancelled': return cancelledCamps
      default: return upcomingCamps
    }
  }

  const getTabLabel = (status) => {
    switch(status) {
      case 'planned': return 'Upcoming'
      case 'ongoing': return 'Ongoing'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const getTabCount = (status) => {
    switch(status) {
      case 'planned': return upcomingCamps.length
      case 'ongoing': return ongoingCamps.length
      case 'completed': return completedCamps.length
      case 'cancelled': return cancelledCamps.length
      default: return 0
    }
  }

  const activeTabData = getActiveTabData()
  const totalPages = Math.ceil(activeTabData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = activeTabData.slice(startIndex, startIndex + itemsPerPage)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleAddCamp = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/camps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newCamp,
          created_by: user.id
        })
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
          assigned_to: [user.id.toString()]
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

  const handleEditCamp = (camp) => {
    setEditingCamp(camp)
    setEditCamp({
      camp_date: camp.camp_date,
      location: camp.location,
      location_link: camp.location_link || '',
      phone_number: camp.phone_number || '',
      status: camp.status,
      conducted_by: camp.conducted_by || '',
      assigned_to: Array.isArray(camp.assigned_to) ? camp.assigned_to : []
    })
    setShowEditModal(true)
  }

  const handleUpdateCamp = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/camps/${editingCamp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  const getAssignedEmployeeNames = (assignedToArray) => {
    if (!assignedToArray || !Array.isArray(assignedToArray) || assignedToArray.length === 0) {
      return []
    }
    
    return assignedToArray
      .map(userId => {
        const employee = employees.find(emp => emp.id.toString() === userId.toString())
        return employee ? employee.name : null
      })
      .filter(name => name !== null)
  }

  const getFilteredEmployees = () => {
    if (!employeeSearchTerm) return employees
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    )
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Camps</h1>
              </div>
            </div>
            
            {/* Header */}
            <div className="mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 sm:p-6 mb-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Camps</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage and track your assigned camps</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
                    >
                      Add Camp
                    </button>
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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
              <button
                onClick={() => handleTabChange('planned')}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-3 sm:p-6 transition-all hover:shadow-md ${
                  activeTab === 'planned' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="sm:ml-4">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upcoming</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{upcomingCamps.length}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTabChange('ongoing')}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-3 sm:p-6 transition-all hover:shadow-md ${
                  activeTab === 'ongoing' ? 'ring-2 ring-yellow-500' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="sm:ml-4">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ongoing</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ongoingCamps.length}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTabChange('completed')}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-3 sm:p-6 transition-all hover:shadow-md ${
                  activeTab === 'completed' ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="sm:ml-4">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{completedCamps.length}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTabChange('cancelled')}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-3 sm:p-6 transition-all hover:shadow-md ${
                  activeTab === 'cancelled' ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="sm:ml-4">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</p>
                    <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cancelledCamps.length}</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Filtered Camps Cards */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 sm:p-6 mb-8`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                {getTabLabel(activeTab)} Camps ({getTabCount(activeTab)})
              </h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {paginatedData.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                    No {getTabLabel(activeTab).toLowerCase()} camps
                  </h3>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-sm mx-auto leading-relaxed`}>
                    You don't have any {getTabLabel(activeTab).toLowerCase()} camps assigned yet.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Your First Camp
                  </button>
                </div>
              ) : (
                <>
                  {/* Phone Layout - Single Column Cards */}
                  <div className="block sm:hidden mb-6">
                    <div className="space-y-4">
                      {paginatedData.map((camp) => (
                      <div key={camp.id} className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden w-full mx-auto`}>
                        <div className="relative">
                          <a href={camp.location_link || `https://www.google.com/maps/search/${encodeURIComponent(camp.location)}`} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                            <div className="w-full h-40 sm:h-48 bg-slate-100 relative overflow-hidden">
                              <iframe 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                loading="lazy" 
                                allowFullScreen 
                                referrerPolicy="no-referrer-when-downgrade" 
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(camp.location)}&z=15&output=embed`} 
                                title="Camp Location Map" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                            </div>
                          </a>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-bold text-gray-800 mb-1">{camp.location}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(camp.camp_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(camp.status)}`}>
                              {camp.status?.charAt(0).toUpperCase() + camp.status?.slice(1)}
                            </span>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conducted by</p>
                              <p className="text-gray-800">{camp.conducted_by || 'Not specified'}</p>
                            </div>
                            {camp.phone_number && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                                <p className="text-gray-800">{camp.phone_number}</p>
                              </div>
                            )}
                            
                            {/* Assigned Employees */}
                            {(() => {
                              const assignedNames = getAssignedEmployeeNames(camp.assigned_to)
                              return assignedNames.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team Members</p>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {assignedNames.map((name, index) => (
                                      <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )
                            })()}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <a href={camp.location_link || `https://www.google.com/maps/search/${encodeURIComponent(camp.location)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">Open map</a>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCamp(camp)}
                                className="px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-full hover:bg-green-50"
                              >
                                Edit
                              </button>
                              <span className="text-xs text-gray-400">#{camp.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* Tablet Layout - Better Structured Cards */}
                  <div className="hidden sm:block lg:hidden mb-6">
                    <div className="space-y-4">
                      {paginatedData.map((camp) => (
                        <div key={camp.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {camp.location}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(camp.status)}`}>
                                  {camp.status?.charAt(0).toUpperCase() + camp.status?.slice(1)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {new Date(camp.camp_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                  </p>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Camp ID: {camp.id}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {camp.conducted_by || 'N/A'}
                                  </p>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {camp.phone_number || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                onClick={() => window.open(camp.location_link, '_blank')}
                                disabled={!camp.location_link}
                                className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 disabled:opacity-50"
                              >
                                View Map
                              </button>
                              <button
                                onClick={() => handleEditCamp(camp)}
                                className="px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-full hover:bg-green-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCamp(camp.id)}
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

                  {/* Desktop Layout - Full Cards with Maps */}
                  <div className="hidden lg:block mb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {paginatedData.map((camp) => (
                        <div key={camp.id} className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                          <div className="relative">
                            <a href={camp.location_link || `https://www.google.com/maps/search/${encodeURIComponent(camp.location)}`} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                              <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
                                <iframe 
                                  width="100%" 
                                  height="100%" 
                                  style={{ border: 0 }} 
                                  loading="lazy" 
                                  allowFullScreen 
                                  referrerPolicy="no-referrer-when-downgrade" 
                                  src={`https://maps.google.com/maps?q=${encodeURIComponent(camp.location)}&z=15&output=embed`} 
                                  title="Camp Location Map" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                              </div>
                            </a>
                          </div>
                          <div className="p-5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-1">{camp.location}</h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(camp.camp_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(camp.status)}`}>
                                {camp.status?.charAt(0).toUpperCase() + camp.status?.slice(1)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Conducted by: {camp.conducted_by || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>Contact: {camp.phone_number || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Camp ID: {camp.id}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={() => window.open(camp.location_link, '_blank')}
                                disabled={!camp.location_link}
                                className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Open Map
                              </button>
                              <button
                                onClick={() => handleEditCamp(camp)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCamp(camp.id)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, activeTabData.length)} of {activeTabData.length} camps
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Recent Camps with Maps */}
            <div className="mb-8">
              <RecentCampsMaps camps={camps} title="Recent Camps" onViewMore={() => {}} />
            </div>

            {/* All My Camps Table */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                All My Camps ({camps.length})
              </h2>
              
              {camps.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    No camps assigned
                  </h3>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    You don't have any camps assigned yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {camps.map((camp) => (
                    <div key={camp.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {camp.location}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {camp.conducted_by || 'N/A'}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {camp.phone_number || 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(camp.status)}`}>
                          {camp.status?.charAt(0).toUpperCase() + camp.status?.slice(1)}
                        </span>
                      </div>
                      
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                        {formatDate(camp.camp_date)}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(camp.location_link, '_blank')}
                          disabled={!camp.location_link}
                          className="flex-1 px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditCamp(camp)}
                          className="flex-1 px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded-full hover:bg-green-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCamp(camp.id)}
                          className="flex-1 px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Camp Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border shadow-lg rounded-md bg-white" style={{ width: '90%', maxWidth: '600px' }}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Camp</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddCamp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Camp Date</label>
                    <input
                      type="date"
                      required
                      value={newCamp.camp_date}
                      onChange={(e) => setNewCamp({...newCamp, camp_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newCamp.status}
                      onChange={(e) => setNewCamp({...newCamp, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planned">Planned</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newCamp.location}
                    onChange={(e) => setNewCamp({...newCamp, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter camp location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Link (Optional)</label>
                  <input
                    type="url"
                    value={newCamp.location_link}
                    onChange={(e) => setNewCamp({...newCamp, location_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newCamp.phone_number}
                      onChange={(e) => setNewCamp({...newCamp, phone_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conducted By</label>
                    <input
                      type="text"
                      value={newCamp.conducted_by}
                      onChange={(e) => setNewCamp({...newCamp, conducted_by: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Conductor name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Employees</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {getFilteredEmployees().map((employee) => {
                        const isCurrentUser = employee.id.toString() === user?.id?.toString()
                        const isChecked = newCamp.assigned_to.includes(employee.id.toString())
                        
                        return (
                          <label key={employee.id} className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isCurrentUser} // Current user can't be unchecked
                              onChange={(e) => {
                                if (isCurrentUser) return // Prevent unchecking current user
                                
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
                              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isCurrentUser ? 'opacity-75' : ''}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">{employee.name}</span>
                                {isCurrentUser && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">You</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{employee.email}</span>
                            </div>
                          </label>
                        )
                      })}
                      {getFilteredEmployees().length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No employees found</p>
                      )}
                    </div>
                  </div>
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
                    Add Camp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Camp Modal */}
      {showEditModal && editingCamp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border shadow-lg rounded-md bg-white" style={{ width: '90%', maxWidth: '600px' }}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Camp</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateCamp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Camp Date</label>
                    <input
                      type="date"
                      required
                      value={editCamp.camp_date}
                      onChange={(e) => setEditCamp({...editCamp, camp_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editCamp.status}
                      onChange={(e) => setEditCamp({...editCamp, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planned">Planned</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editCamp.location}
                    onChange={(e) => setEditCamp({...editCamp, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter camp location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Link (Optional)</label>
                  <input
                    type="url"
                    value={editCamp.location_link}
                    onChange={(e) => setEditCamp({...editCamp, location_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editCamp.phone_number}
                      onChange={(e) => setEditCamp({...editCamp, phone_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conducted By</label>
                    <input
                      type="text"
                      value={editCamp.conducted_by}
                      onChange={(e) => setEditCamp({...editCamp, conducted_by: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Conductor name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Employees</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {getFilteredEmployees().map((employee) => {
                        const isCurrentUser = employee.id.toString() === user?.id?.toString()
                        const isChecked = editCamp.assigned_to.includes(employee.id.toString())
                        
                        return (
                          <label key={employee.id} className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isCurrentUser} // Current user can't be unchecked
                              onChange={(e) => {
                                if (isCurrentUser) return // Prevent unchecking current user
                                
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
                              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isCurrentUser ? 'opacity-75' : ''}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">{employee.name}</span>
                                {isCurrentUser && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">You</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{employee.email}</span>
                            </div>
                          </label>
                        )
                      })}
                      {getFilteredEmployees().length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No employees found</p>
                      )}
                    </div>
                  </div>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Update Camp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
