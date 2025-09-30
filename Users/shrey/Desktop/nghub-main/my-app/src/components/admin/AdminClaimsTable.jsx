import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import UserCard from '../../components/employee/UserCard'

const processStateOptions = ['ALO', 'Nodal Officer', 'Board', 'Settled']

export default function AdminClaimsTable({ claims = [], card, onRefresh, onEditCard }) {
  const { getAuthHeaders } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [claims])

  const handleStartEdit = (claim) => {
    setEditingId(claim.id)
    setEditDraft({
      process_state: claim.process_state || '',
      discussed_amount: claim.discussed_amount || 0,
      paid_amount: claim.paid_amount || 0,
      pending_amount: claim.pending_amount || 0,
      created_at: claim.created_at || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditDraft({})
  }

  const handleChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (claimId) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(editDraft)
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to update claim')
      }
      handleCancelEdit()
      onRefresh?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (claimId) => {
    if (!confirm('Delete this claim?')) return
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete claim')
      }
      onRefresh?.()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEditCard = () => {
    onEditCard?.(card)
  }

  if (!card && sortedClaims.length === 0) {
    return <div className="text-center py-10 text-gray-500 text-sm">No card or claims found for this customer.</div>
  }

  return (
    <div className="space-y-6">
      {card && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleEditCard}
              className="px-3 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50"
            >
              Edit Card
            </button>
          </div>
          <div className="flex justify-center">
            <UserCard
              cardNumber={card.card_number}
              registerNumber={card.register_number}
              cardHolderName={card.card_holder_name}
              agentName={card.agent_name}
              agentMobile={card.agent_mobile}
              createdDate={card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process State</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discussed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClaims.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-center text-gray-500">No claims recorded for this card.</td>
              </tr>
            ) : sortedClaims.map((claim) => {
              const isEditing = editingId === claim.id
              return (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {isEditing ? (
                      <select
                        value={editDraft.process_state}
                        onChange={(e) => handleChange('process_state', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      >
                        {processStateOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{claim.process_state || 'N/A'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editDraft.discussed_amount}
                        onChange={(e) => handleChange('discussed_amount', e.target.value)}
                        className="px-2 py-1 w-24 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-sm"
                      />
                    ) : (
                      `₹${claim.discussed_amount}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editDraft.paid_amount}
                        onChange={(e) => handleChange('paid_amount', e.target.value)}
                        className="px-2 py-1 w-24 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-sm"
                      />
                    ) : (
                      `₹${claim.paid_amount}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editDraft.pending_amount}
                        onChange={(e) => handleChange('pending_amount', e.target.value)}
                        className="px-2 py-1 w-24 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 text-sm"
                      />
                    ) : (
                      `₹${claim.pending_amount}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(claim.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-100"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-between space-x-2">
                        <button
                          onClick={() => handleStartEdit(claim)}
                          className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100 rounded-full hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(claim.id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 border border-red-100 rounded-full hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


