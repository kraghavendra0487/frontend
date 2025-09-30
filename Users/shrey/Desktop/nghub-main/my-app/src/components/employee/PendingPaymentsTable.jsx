export default function PendingPaymentsTable({ 
  customers, 
  customerCards, 
  onEditCustomer, 
  onAddCard, 
  onViewCard, 
  onAddClaim, 
  onViewClaims 
}) {
  const calculatePendingAmount = (discussedAmount, paidAmount) => {
    return Math.max(0, discussedAmount - paidAmount)
  }

  const pendingPayments = customers.filter(customer => 
    calculatePendingAmount(parseFloat(customer.discussed_amount), parseFloat(customer.paid_amount)) > 0
  )

  if (pendingPayments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending payments found.</p>
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
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type of Work
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
              Mode of Payment
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
          {pendingPayments.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEditCustomer(customer)}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {customer.customer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.phone_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.type_of_work}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹{customer.discussed_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹{customer.paid_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                ₹{calculatePendingAmount(parseFloat(customer.discussed_amount), parseFloat(customer.paid_amount))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.mode_of_payment}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(customer.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-wrap gap-1">
                      {customerCards[customer.id] ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewCard(customer.id); }}
                          className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                        >
                          View Card
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAddCard(customer.id); }}
                          className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                        >
                          Add Card
                        </button>
                      )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-wrap gap-1">
                  {customerCards[customer.id] ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddClaim(customer.id); }}
                        className="text-green-600 hover:text-green-900 text-xs font-medium"
                      >
                        Add Claim
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewClaims(customer.id); }}
                        className="text-purple-600 hover:text-purple-900 text-xs font-medium"
                      >
                        View Claims
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      Card Required
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
