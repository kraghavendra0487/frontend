import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'

export default function AdminMeesevaPage() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [meesevaRecords, setMeesevaRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Form states
  const [newRecord, setNewRecord] = useState({
    name: '',
    advance_amount: '',
    used_amount: '',
    comment: ''
  })

  const [editRecord, setEditRecord] = useState({
    name: '',
    advance_amount: '',
    used_amount: '',
    comment: ''
  })

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
    fetchMeesevaRecords().finally(() => setLoading(false))
  }, [user, navigate])

  // Filter records based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(meesevaRecords)
    } else {
      const filtered = meesevaRecords.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.comment && record.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        record.id.toString().includes(searchTerm)
      )
      setFilteredRecords(filtered)
    }
  }, [meesevaRecords, searchTerm])

  const fetchMeesevaRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meeseva`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        setMeesevaRecords(data)
        setFilteredRecords(data)
      } else {
        setError(data.error || 'Failed to fetch meeseva records')
      }
    } catch (error) {
      console.error('Error fetching meeseva records:', error)
      setError('Failed to fetch meeseva records')
    }
  }

  const handleAddRecord = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/meeseva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newRecord)
      })

      if (response.ok) {
        setSuccess('Meeseva record added successfully')
        setShowAddModal(false)
        setNewRecord({
          name: '',
          advance_amount: '',
          used_amount: '',
          comment: ''
        })
        fetchMeesevaRecords()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add meeseva record')
      }
    } catch (error) {
      console.error('Error adding meeseva record:', error)
      setError('Failed to add meeseva record')
    }
  }

  const handleEditRecord = (record) => {
    setEditingRecord(record)
    setEditRecord({
      name: record.name,
      advance_amount: record.advance_amount,
      used_amount: record.used_amount,
      comment: record.comment || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateRecord = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/meeseva/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(editRecord)
      })

      if (response.ok) {
        setSuccess('Meeseva record updated successfully')
        setShowEditModal(false)
        setEditingRecord(null)
        fetchMeesevaRecords()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update meeseva record')
      }
    } catch (error) {
      console.error('Error updating meeseva record:', error)
      setError('Failed to update meeseva record')
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!confirm('Are you sure you want to delete this meeseva record?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/meeseva/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        setSuccess('Meeseva record deleted successfully')
        fetchMeesevaRecords()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete meeseva record')
      }
    } catch (error) {
      console.error('Error deleting meeseva record:', error)
      setError('Failed to delete meeseva record')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <AdminSidebar
          user={user}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto h-screen">
          <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Meeseva Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage advance payments and their usage tracking
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button
                onClick={() => setError('')}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
              <button
                onClick={() => setSuccess('')}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Search Bar and Add Button */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, comment, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Add New Meeseva Record
            </button>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg shadow bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Advance Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Used Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Pending Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'No records match your search' : 'No meeseva records found'}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(record.advance_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(record.used_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(record.pending_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.comment || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        

      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-md w-full bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Meeseva Record
              </h3>
            </div>
            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Advance Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newRecord.advance_amount}
                  onChange={(e) => setNewRecord({...newRecord, advance_amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Used Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newRecord.used_amount}
                  onChange={(e) => setNewRecord({...newRecord, used_amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Comment
                </label>
                <textarea
                  value={newRecord.comment}
                  onChange={(e) => setNewRecord({...newRecord, comment: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

        {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-md w-full bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Meeseva Record
              </h3>
            </div>
            <form onSubmit={handleUpdateRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={editRecord.name}
                  onChange={(e) => setEditRecord({...editRecord, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Advance Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editRecord.advance_amount}
                  onChange={(e) => setEditRecord({...editRecord, advance_amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Used Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editRecord.used_amount}
                  onChange={(e) => setEditRecord({...editRecord, used_amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Comment
                </label>
                <textarea
                  value={editRecord.comment}
                  onChange={(e) => setEditRecord({...editRecord, comment: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

      
    </div>
  </div>  
  )
        
}
