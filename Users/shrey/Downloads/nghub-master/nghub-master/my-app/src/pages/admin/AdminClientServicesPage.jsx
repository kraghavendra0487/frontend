import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'

export default function AdminClientServicesDetailPage() {
  const { user, getAuthHeaders, logout } = useAuth()
  const navigate = useNavigate()
  const { clientId } = useParams()

  // State management
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState(null)
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)

  // Form states
  const [newService, setNewService] = useState({
    service_name: '',
    service_status: '',
    remarks: ''
  })

  const [editService, setEditService] = useState({
    service_name: '',
    service_status: '',
    remarks: ''
  })

  // Service statuses
  const [serviceStatuses, setServiceStatuses] = useState([])

  // Form submission state - moved to top for better accessibility
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create stable reference for JSX usage
  const isSubmittingRef = useRef(isSubmitting)
  isSubmittingRef.current = isSubmitting

  // Helper functions - defined outside component to avoid hoisting issues
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  useEffect(() => {
    if (!user) return

    if (user.role !== 'admin') {
      navigate('/employee', { replace: true })
      return
    }

    if (clientId) {
      fetchClientAndServices()
    }
  }, [user, navigate, clientId])

  const fetchClientAndServices = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch client details
      const clientResponse = await fetch(`${API_BASE_URL}/api/client-services/${clientId}`, {
        headers: getAuthHeaders()
      })

      if (!clientResponse.ok) {
        throw new Error('Client not found')
      }

      const clientData = await clientResponse.json()
      setClient(clientData)

      // Fetch client services
      const servicesResponse = await fetch(`${API_BASE_URL}/api/client-services/${clientId}/services`, {
        headers: getAuthHeaders()
      })

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      }

      // Fetch service statuses
      const statusesResponse = await fetch(`${API_BASE_URL}/api/client-services/service-statuses`, { 
        headers: getAuthHeaders() 
      })

      if (statusesResponse.ok) {
        const statusesData = await statusesResponse.json()
        setServiceStatuses(statusesData)
      }

    } catch (error) {
      console.error('Error fetching client and services:', error)
      setError(error.message || 'Failed to fetch client data')
    } finally {
      setLoading(false)
    }
  }

  // Service management functions
  const handleAddService = async (e) => {
    e.preventDefault()

    if (isSubmittingRef.current) return // Prevent multiple submissions

    if (!newService.service_name) {
      setError('Please select a service')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setIsSubmitting(true)
      isSubmittingRef.current = true
      const response = await fetch(`${API_BASE_URL}/api/client-services/${clientId}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(newService)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add service')
      }

      setSuccess('Service added successfully')
      setShowAddServiceModal(false)
      setNewService({ service_name: '', service_status: '', remarks: '' })
      fetchClientAndServices()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error adding service:', error)
      setError(error.message || 'Failed to add service')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  const handleEditService = (service) => {
    setEditingService(service)
    setEditService({
      service_name: service.service_name,
      service_status: service.service_status,
      remarks: service.remarks
    })
    setShowEditServiceModal(true)
  }

  const handleUpdateService = async (e) => {
    e.preventDefault()

    if (!editService.service_name) {
      setError('Please select a service')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/client-services/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editService)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update service')
      }

      setSuccess('Service updated successfully')
      setShowEditServiceModal(false)
      setEditingService(null)
      fetchClientAndServices()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating service:', error)
      setError(error.message || 'Failed to update service')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/client-services/services/${serviceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        setSuccess('Service deleted successfully')
        fetchClientAndServices()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete service')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      setError('Failed to delete service')
      setTimeout(() => setError(''), 3000)
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

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex h-screen">
          <AdminSidebar user={user} onLogout={logout} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Client Not Found</h2>
              <p className="text-gray-600 mb-4">The client you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/admin/clients')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Clients
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Admin Sidebar */}
        <AdminSidebar
          user={user}
          onLogout={logout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900">

            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                  <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate('/admin/clients')}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                      >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        <span>Back to Clients</span>
                      </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">
                      Services for {client.establishment_name}
                    </h1>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p><strong>Establishment:</strong> {client.establishment_name || 'N/A'}</p>
                      <p><strong>Employer:</strong> {client.employer_name || 'N/A'}</p>
                      <p><strong>Mobile:</strong> {client.mobile_number || 'N/A'}</p>
                      <p><strong>Email:</strong> {client.email_id || 'N/A'}</p>
                      <p><strong>Added:</strong> {formatTimestamp(client.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAddServiceModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Service</span>
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

            {/* Services Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Services ({services.length})
                </h2>
              </div>

              {services.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add services to track work for this client.
                  </p>
                      <button
                    onClick={() => setShowAddServiceModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                      >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add First Service</span>
                      </button>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Service Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                              {service.service_name}
                          </div>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              service.service_status === 'Completed' ? 'bg-green-100 text-green-800' :
                              service.service_status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              service.service_status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                              service.service_status === 'Not Started' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {service.service_status || 'Not Set'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={service.remarks}>
                              {service.remarks || 'No remarks'}
                            </div>
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                              {formatTimestamp(service.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                              onClick={() => handleEditService(service)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            {/* Add Service Modal */}
            {showAddServiceModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Service</h3>
                    <form onSubmit={handleAddService}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isSubmittingRef.current}
                          value={newService.service_name}
                          onChange={(e) => setNewService({...newService, service_name: e.target.value})}
                          placeholder="Enter service name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          disabled={isSubmittingRef.current}
                          value={newService.service_status}
                          onChange={(e) => setNewService({...newService, service_status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Status</option>
                          {serviceStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>


                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks
                        </label>
                        <textarea
                          disabled={isSubmittingRef.current}
                          value={newService.remarks}
                          onChange={(e) => setNewService({...newService, remarks: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Additional remarks about this service..."
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowAddServiceModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingRef.current}
                          className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                            isSubmittingRef.current
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isSubmittingRef.current ? 'Adding...' : 'Add Service'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Service Modal */}
            {showEditServiceModal && editingService && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Service</h3>
                    <form onSubmit={handleUpdateService}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editService.service_name}
                          onChange={(e) => setEditService({...editService, service_name: e.target.value})}
                          placeholder="Enter service name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={editService.service_status}
                          onChange={(e) => setEditService({...editService, service_status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Status</option>
                          {serviceStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>


                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks
                        </label>
                        <textarea
                          value={editService.remarks}
                          onChange={(e) => setEditService({...editService, remarks: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                  <button
                          type="button"
                          onClick={() => setShowEditServiceModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                  </button>
                  <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                          Update Service
                  </button>
                </div>
                    </form>
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
