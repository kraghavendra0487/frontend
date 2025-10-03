import { useState } from 'react'
import API_BASE_URL from '../../config/api'

export default function ClaimsTable({ claims, cardId, onRefresh }) {
  const [editingClaim, setEditingClaim] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClaim, setNewClaim] = useState({
    type_of_claim: '',
    process_state: '',
    discussed_amount: '',
    paid_amount: '',
    pending_amount: ''
  })

  const handleEdit = (claim) => {
    setEditingClaim({
      id: claim.id,
      type_of_claim: claim.type_of_claim,
      process_state: claim.process_state,
      discussed_amount: claim.discussed_amount.toString(),
      paid_amount: claim.paid_amount.toString(),
      pending_amount: claim.pending_amount.toString()
    })
    setShowEditForm(true)
  }

  const handleUpdateClaim = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/claims/${editingClaim.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type_of_claim: editingClaim.type_of_claim,
          process_state: editingClaim.process_state,
          discussed_amount: parseFloat(editingClaim.discussed_amount) || 0,
          paid_amount: parseFloat(editingClaim.paid_amount) || 0,
          pending_amount: parseFloat(editingClaim.pending_amount) || 0
        })
      })

      if (response.ok) {
        setShowEditForm(false)
        setEditingClaim(null)
        if (onRefresh && typeof onRefresh === 'function') {
          onRefresh()
        }
        alert('Claim updated successfully!')
      } else {
        const data = await response.json()
        console.error('Failed to update claim:', data)
        alert(data.error || `Failed to update claim: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Network error updating claim:', error)
      alert(`Network error: ${error.message}. Please try again.`)
    }
  }

  const handleDelete = async (claimId) => {
    if (!confirm('Are you sure you want to delete this claim?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        if (onRefresh && typeof onRefresh === 'function') {
          onRefresh()
        }
        alert('Claim deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete claim')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const handleAddClaim = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type_of_claim: newClaim.type_of_claim,
          process_state: newClaim.process_state,
          discussed_amount: parseFloat(newClaim.discussed_amount) || 0,
          paid_amount: parseFloat(newClaim.paid_amount) || 0,
          pending_amount: parseFloat(newClaim.pending_amount) || 0,
          card_id: cardId
        })
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewClaim({
          type_of_claim: '',
          process_state: '',
          discussed_amount: '',
          paid_amount: '',
          pending_amount: ''
        })
        if (onRefresh && typeof onRefresh === 'function') {
          onRefresh()
        }
        alert('Claim added successfully!')
      } else {
        const data = await response.json()
        console.error('Failed to add claim:', data)
        alert(data.error || `Failed to add claim: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Network error adding claim:', error)
      alert(`Network error: ${error.message}. Please try again.`)
    }
  }

  return (
    <div>
      {/* Add Claim Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Claims ({claims.length})</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Add Claim
        </button>
      </div>

      {/* Add Claim Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add New Claim</h4>
          <form onSubmit={handleAddClaim} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Claim</label>
                <select
                  required
                  value={newClaim.type_of_claim}
                  onChange={(e) => setNewClaim({...newClaim, type_of_claim: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select claim type</option>
                  <option value="Marriage gift">Marriage gift</option>
                  <option value="Maternity benefit">Maternity benefit</option>
                  <option value="Natural Death">Natural Death</option>
                  <option value="Accidental death">Accidental death</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Process State</label>
                <select
                  value={newClaim.process_state}
                  onChange={(e) => setNewClaim({...newClaim, process_state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select process state</option>
                  <option value="ALO">ALO</option>
                  <option value="Nodal Officer">Nodal Officer</option>
                  <option value="Board">Board</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discussed Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newClaim.discussed_amount}
                  onChange={(e) => {
                    const discussed = parseFloat(e.target.value) || 0
                    const paid = parseFloat(newClaim.paid_amount) || 0
                    const pending = Math.max(0, discussed - paid)
                    setNewClaim({
                      ...newClaim, 
                      discussed_amount: e.target.value,
                      pending_amount: pending.toString()
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newClaim.paid_amount}
                  onChange={(e) => {
                    const discussed = parseFloat(newClaim.discussed_amount) || 0
                    const paid = parseFloat(e.target.value) || 0
                    const pending = Math.max(0, discussed - paid)
                    setNewClaim({
                      ...newClaim, 
                      paid_amount: e.target.value,
                      pending_amount: pending.toString()
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pending (Auto)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newClaim.pending_amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Add Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Claim Form */}
      {showEditForm && editingClaim && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Edit Claim</h4>
          <form onSubmit={handleUpdateClaim} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Claim</label>
                <select
                  required
                  value={editingClaim.type_of_claim}
                  onChange={(e) => setEditingClaim({...editingClaim, type_of_claim: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select claim type</option>
                  <option value="Marriage gift">Marriage gift</option>
                  <option value="Maternity benefit">Maternity benefit</option>
                  <option value="Natural Death">Natural Death</option>
                  <option value="Accidental death">Accidental death</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Process State</label>
                <select
                  value={editingClaim.process_state}
                  onChange={(e) => setEditingClaim({...editingClaim, process_state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select process state</option>
                  <option value="ALO">ALO</option>
                  <option value="Nodal Officer">Nodal Officer</option>
                  <option value="Board">Board</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discussed Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingClaim.discussed_amount}
                  onChange={(e) => {
                    const discussed = parseFloat(e.target.value) || 0
                    const paid = parseFloat(editingClaim.paid_amount) || 0
                    const pending = Math.max(0, discussed - paid)
                    setEditingClaim({
                      ...editingClaim, 
                      discussed_amount: e.target.value,
                      pending_amount: pending.toString()
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingClaim.paid_amount}
                  onChange={(e) => {
                    const discussed = parseFloat(editingClaim.discussed_amount) || 0
                    const paid = parseFloat(e.target.value) || 0
                    const pending = Math.max(0, discussed - paid)
                    setEditingClaim({
                      ...editingClaim, 
                      paid_amount: e.target.value,
                      pending_amount: pending.toString()
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pending (Auto)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingClaim.pending_amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingClaim(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Update Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {claims.length === 0 && !showAddForm ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No claims found for this card.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type of Claim
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Process State
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Discussed Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paid Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pending Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {claims.map((claim) => (
            <tr key={claim.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {claim.type_of_claim}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  claim.process_state === 'ALO' ? 'bg-blue-100 text-blue-800' :
                  claim.process_state === 'Nodal Officer' ? 'bg-yellow-100 text-yellow-800' :
                  claim.process_state === 'Board' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {claim.process_state}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{claim.discussed_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{claim.paid_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{claim.pending_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(claim.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(claim)}
                    className="text-blue-600 hover:text-blue-900 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(claim.id)}
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
      )}
    </div>
  )
}
