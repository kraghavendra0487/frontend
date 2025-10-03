import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'

export default function AddCampPage() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({
    camp_date: '',
    location: '',
    location_link: '',
    phone_number: '',
    status: 'planned',
    conducted_by: '',
    assigned_to: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
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

  useEffect(() => {
    if (!user) {
      setLoading(false)
      navigate('/login', { replace: true })
      return
    }
    if (user.role !== 'admin') {
      navigate('/employee', { replace: true })
      return
    }
    fetchEmployees().finally(() => setLoading(false))
  }, [user, navigate])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/employees`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        const employeeOnly = (data.users || data.employees || data || []).filter((emp) => emp.role === 'employee')
        setEmployees(employeeOnly)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'assigned_to') {
      // Handle multiple selection
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
      setFormData({ ...formData, [name]: selectedOptions })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validation
    if (formData.assigned_to.length === 0) {
      setError('Please select at least one employee to assign the camp to')
      setSubmitting(false)
      return
    }

    try {
      // Convert assigned_to array passed as JSON (backend handles storage)
      const campData = {
        ...formData,
        assigned_to: formData.assigned_to // Send as JSON array, let backend handle conversion
      }
      
      console.log('Sending camp data:', campData)
      console.log('assigned_to format:', campData.assigned_to)
      
      const response = await fetch(`${API_BASE_URL}/api/camps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(campData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Camp added successfully!')
        // Reset form
        setFormData({
          camp_date: '',
          location: '',
          location_link: '',
          phone_number: '',
          status: 'planned',
          conducted_by: '',
          assigned_to: []
        })
        setTimeout(() => {
          navigate('/admin/camps') // Redirect back to camp management
        }, 2000)
      } else {
        setError(data.error || 'Failed to add camp')
      }
    } catch (err) {
      console.error('Network error:', err)
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

  const handleLogout = () => logout()

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex h-screen">
        {/* Admin Navbar */}
        <AdminSidebar 
          user={user} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Add Camp</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Schedule a new camp in the system</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/admin/camps')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Back to Camps
                    </button>
                  </div>
                </div>
              </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="camp_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Camp Date *
                </label>
                <input
                  type="date"
                  id="camp_date"
                  name="camp_date"
                  value={formData.camp_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="planned">Planned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter camp location"
              />
            </div>

            <div>
              <label htmlFor="location_link" className="block text-sm font-medium text-gray-700 mb-1">
                Location Link
              </label>
              <input
                type="url"
                id="location_link"
                name="location_link"
                value={formData.location_link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter contact phone number"
              />
            </div>

            <div>
              <label htmlFor="conducted_by" className="block text-sm font-medium text-gray-700 mb-1">
                Conducted By *
              </label>
              <input
                type="text"
                id="conducted_by"
                name="conducted_by"
                value={formData.conducted_by}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter conductor name"
              />
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
                    const isChecked = formData.assigned_to.includes(employee.id.toString())
                    
                    return (
                      <label key={employee.id} className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assigned_to: [...formData.assigned_to, employee.id.toString()]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                assigned_to: formData.assigned_to.filter(id => id !== employee.id.toString())
                              })
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">{employee.name}</span>
                            <span className="text-xs text-gray-500">({employee.employee_id})</span>
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
                {formData.assigned_to.length > 0 && (
                  <p className="text-xs text-green-600">
                    {formData.assigned_to.length} employee(s) selected
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
              style={{ backgroundColor: '#fcb72d' }}
            >
              {submitting ? 'Adding Camp...' : 'Add Camp'}
            </button>
          </form>
        </div>
          </div>
        </main>
      </div>
    </div>
  )
}
