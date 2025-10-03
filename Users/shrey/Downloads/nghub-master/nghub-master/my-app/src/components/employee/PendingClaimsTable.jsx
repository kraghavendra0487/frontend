export default function PendingClaimsTable({ 
  customers,
  customerCards, 
  onEditCustomer, 
  onAddCard, 
  onViewCard, 
  onAddClaim, 
  onViewClaims 
}) {
  const pendingClaims = []
  
  Object.values(customerCards).forEach((card) => {
    if (card.claims) {
      card.claims.forEach((claim) => {
        if (claim.pending_amount && parseFloat(claim.pending_amount) > 0) {
          pendingClaims.push({
            ...claim,
            customer_name: card.customer_name,
            card_number: card.card_number
          })
        }
      })
    }
  })

  if (pendingClaims.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending claims found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Card Number
            </th>
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
              Card Actions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Claims Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pendingClaims.map((claim) => (
            <tr key={claim.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {claim.customer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {claim.card_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {claim.type_of_claim}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {claim.process_state}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹{claim.discussed_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹{claim.paid_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                ₹{claim.pending_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(claim.created_at).toLocaleDateString()}
              </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                 <div className="flex flex-wrap gap-1">
                   <span className="text-gray-400 text-xs">
                     Card Available
                   </span>
                 </div>
               </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddClaim(claim.customer_id); }}
                    className="text-green-600 hover:text-green-900 text-xs font-medium"
                  >
                    Add Claim
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewClaims(claim.customer_id); }}
                    className="text-purple-600 hover:text-purple-900 text-xs font-medium"
                  >
                    View Claims
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
