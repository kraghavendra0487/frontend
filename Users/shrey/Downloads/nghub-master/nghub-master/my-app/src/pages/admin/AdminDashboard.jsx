import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
  import ClaimTypeStatsVisualization from '../../components/ClaimTypeStatsVisualization'
import API_BASE_URL from '../../config/api'
import FinancialMetrics from '../../components/FinancialMetrics'
  import RecentCampsMaps from '../../components/RecentCampsMaps'

export default function AdminDashboard() {
  const { user, getAuthHeaders, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [customers, setCustomers] = useState([])
  const [camps, setCamps] = useState([])
  const [cards, setCards] = useState([])
  const [claims, setClaims] = useState([])
  const [error, setError] = useState('')
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [upcomingPageSize] = useState(5)
  const navigate = useNavigate()

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/employees`, { headers: getAuthHeaders() })
      const data = await response.json()
      const list = Array.isArray(data) ? data : (data.users || data.employees || [])
      setEmployees(list)
    } catch (error) {
      setError('Failed to fetch employees')
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, { headers: getAuthHeaders() })
      const data = await response.json()
      const list = Array.isArray(data) ? data : (data.customers || [])
      setCustomers(list)
    } catch (error) {
      setError('Failed to fetch customers')
    }
  }

  const fetchCamps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/camps`, { headers: getAuthHeaders() })
      const data = await response.json()
      const list = Array.isArray(data) ? data : (data.camps || [])
      setCamps(list)
    } catch (error) {
      setError('Failed to fetch camps')
    }
  }

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards`, { headers: getAuthHeaders() })
      const data = await response.json()
      const fromData = data && (data.cards || data.data || data.list || data)
      const list = Array.isArray(fromData) ? fromData : (fromData ? [fromData] : [])
      setCards(list)
    } catch (error) {
      setError('Failed to fetch cards')
    }
  }

  const fetchClaims = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/claims`, { headers: getAuthHeaders() })
        const data = await response.json()
      const list = Array.isArray(data) ? data : (data.claims || [])
      setClaims(list)
      } catch (error) {
      setError('Failed to fetch claims')
    }
  }

  useEffect(() => {
    if (!user) { setLoading(false); return }
    if (user.role !== 'admin') { navigate('/employee', { replace: true }); return }
    Promise.all([fetchEmployees(), fetchCustomers(), fetchCamps(), fetchCards(), fetchClaims()])
      .finally(() => setLoading(false))
  }, [user, navigate])

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

  const employeesCount = employees.length
  const employeesActive = employees.filter(emp => emp.role === 'employee').length
  const totalCustomers = customers.length
  const totalCards = cards.length
  const totalClaims = claims.length
  const toNumber = (v) => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  const totalPaid = customers.reduce((sum, c) => sum + toNumber(c.paid_amount), 0)
  const pendingCustomerPayments = customers.reduce((sum, c) => sum + toNumber(c.pending_amount), 0)
  const getState = (cl) => (cl.process_state || cl.status || '').toLowerCase()
  const pendingClaimsAmount = claims.filter(cl => ['pending','initiated'].includes(getState(cl))).reduce((s, cl) => s + toNumber(cl.pending_amount || cl.discussed_amount || 0), 0)
  const totalDiscussed = totalPaid + pendingCustomerPayments + pendingClaimsAmount
  const completedCamps = camps.filter(c => (c.status || '').toLowerCase() === 'completed')
  const plannedCamps = camps.filter(c => (c.status || '').toLowerCase() === 'planned')
  const ongoingCamps = camps.filter(c => (c.status || '').toLowerCase() === 'ongoing')
  const pendingCampsCount = plannedCamps.length + ongoingCamps.length

  const byDateDesc = (a, b) => new Date(b.camp_date) - new Date(a.camp_date)
  const byDateAsc = (a, b) => new Date(a.camp_date) - new Date(b.camp_date)
  const recentCamps = [...camps].sort(byDateDesc).slice(0, 4)
  const today = new Date(); today.setHours(0,0,0,0)
  const upcoming = camps.filter(c => { const d = new Date(c.camp_date); d.setHours(0,0,0,0); return d >= today }).sort(byDateAsc)
  const totalUpcomingPages = Math.max(1, Math.ceil(upcoming.length / upcomingPageSize))
  const currentUpcomingPage = Math.min(upcomingPage, totalUpcomingPages)
  const upcomingSlice = upcoming.slice((currentUpcomingPage - 1) * upcomingPageSize, currentUpcomingPage * upcomingPageSize)

  const sortByCreatedDesc = (list) => [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  const recentEmployees = sortByCreatedDesc(employees).slice(0, 10)
  const recentCustomers = sortByCreatedDesc(customers).slice(0, 10)

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
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}</p>
                  </div>
                  <div className="flex items-center space-x-12">
                    {/* Header stats - icon + count in a row, label below */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v7a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        </svg>
                        <div className="text-xl font-semibold text-gray-900">{employeesCount.toLocaleString()}</div>
                      </div>
                      <div className="text-[11px] text-gray-600">Employees</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116 0" />
                        </svg>
                        <div className="text-xl font-semibold text-gray-900">{totalCustomers.toLocaleString()}</div>
                      </div>
                      <div className="text-[11px] text-gray-600">Customers</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
                          <path d="M3 10h18" />
                        </svg>
                        <div className="text-xl font-semibold text-gray-900">{totalCards.toLocaleString()}</div>
                      </div>
                      <div className="text-[11px] text-gray-600">Cards</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                  <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </div>
              )}
            </div>

            {/* Row 1 removed to avoid duplicates with header */}

            {/* Row 2: Claim Type Visualization */}
            <ClaimTypeStatsVisualization claims={claims} title="Claim Type Analysis" />

            {/* Row 3: Financial Metrics */}
            <div className="mb-8">
              <FinancialMetrics
                items={[
                  { id: 1, name: 'Total Paid Till Now', subtitle: 'Total amount received across customers', value: `₹${totalPaid.toLocaleString()}`, color: 'text-emerald-500', bgColor: 'bg-emerald-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />) },
                  { id: 2, name: 'Pending Customer Payments', subtitle: 'Outstanding from customers', value: `₹${pendingCustomerPayments.toLocaleString()}`, color: 'text-amber-500', bgColor: 'bg-amber-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />) },
                  { id: 3, name: 'Pending Claims Amount', subtitle: 'Claims yet to be settled', value: `₹${pendingClaimsAmount.toLocaleString()}`, color: 'text-red-500', bgColor: 'bg-red-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) },
                  { id: 4, name: 'Discussed Amount', subtitle: 'Total negotiated amount', value: `₹${totalDiscussed.toLocaleString()}`, color: 'text-indigo-500', bgColor: 'bg-indigo-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />) }
                ]}
              />
                  </div>

            {/* Recent Camps - Full Row */}
            <div className="mb-8">
              <div className={`bg-white rounded-lg shadow-sm p-6`}>
                <RecentCampsMaps camps={camps} title="Recent Camps" onViewMore={() => navigate('/admin/camps')} />
                </div>
              </div>

            {/* Recent joins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Employees</h2>
                  <button onClick={() => navigate('/admin/employees')} className="text-sm text-blue-600 hover:underline">View more</button>
                  </div>
                <div className="space-y-3">
                  {recentEmployees.slice(0, 5).map(emp => (
                    <div key={emp.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${emp.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {(emp.name || emp.email || '??').trim().charAt(0).toUpperCase()}
                  </div>
                        <div>
                          <p className="text-gray-900 font-medium">{emp.name}</p>
                          <p className="text-gray-600 text-sm">{emp.email}</p>
                </div>
              </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${emp.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{emp.role}</span>
                  </div>
                  ))}
                  {recentEmployees.length === 0 && (
                    <p className="text-gray-600">No employees found.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Customers</h2>
                  <button onClick={() => navigate('/admin/customers')} className="text-sm text-blue-600 hover:underline">View more</button>
                </div>
                <div className="space-y-3">
                  {recentCustomers.slice(0, 5).map(cust => (
                    <div key={cust.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold">
                          {(cust.customer_name || cust.email || '??').trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{cust.customer_name}</p>
                          <p className="text-gray-600 text-sm">{cust.email || cust.phone_number}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>ID {cust.id}</span>
                  </div>
                  ))}
                  {recentCustomers.length === 0 && (
                    <p className="text-gray-600">No customers found.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/admin/add-employee')}
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-900">Add Employee</h3>
                      <p className="text-sm text-gray-500">Register new employee</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/add-camp')}
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-900">Add Camp</h3>
                      <p className="text-sm text-gray-500">Schedule new camp</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/employees')}
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-900">Manage Employees</h3>
                      <p className="text-sm text-gray-500">View all employees</p>
                    </div>
                  </div>
                </button>

              </div>
            </div>

            
          </div>
        </main>
      </div>
    </div>
  )
}
