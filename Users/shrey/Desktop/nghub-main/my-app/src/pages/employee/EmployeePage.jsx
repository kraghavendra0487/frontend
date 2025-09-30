import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import EmployeeSidebar from '../../components/EmployeeSidebar'
import EditCustomerForm from '../../components/employee/EditCustomerForm'
import CardForm from '../../components/employee/CardForm'
import ClaimsTable from '../../components/employee/ClaimsTable'
import ClaimTypeStatsVisualization from '../../components/ClaimTypeStatsVisualization'
import FinancialMetrics from '../../components/FinancialMetrics'
import RecentCampsMaps from '../../components/RecentCampsMaps'
import PendingPaymentsTable from '../../components/employee/PendingPaymentsTable'
import PendingClaimsTable from '../../components/employee/PendingClaimsTable'
import UserCard from '../../components/employee/UserCard'
import WhiteCardPopup from '../../components/WhiteCardPopup'

export default function EmployeeDashboard() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [camps, setCamps] = useState([])
  const [completedCamps, setCompletedCamps] = useState([])
  const [cards, setCards] = useState([])
  const [claims, setClaims] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const toNumber = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const totalPaid = customers.reduce((sum, c) => sum + toNumber(c.paid_amount), 0)
  const pendingCustomerPayments = customers.reduce((sum, c) => sum + toNumber(c.pending_amount), 0)
  const pendingClaimsAmount = claims.reduce((sum, cl) => sum + toNumber(cl.pending_amount || 0), 0)
  const totalDiscussed = totalPaid + pendingCustomerPayments + pendingClaimsAmount

  const getState = (cl) => (cl?.process_state || cl?.status || '').toLowerCase()

  const fetchEmployeeClaims = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!user?.id) return
      const response = await fetch(`/api/claims/employee/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setClaims(Array.isArray(data) ? data : (data.claims || []))
      } else {
        setClaims([])
      }
    } catch (e) {
      setClaims([])
    }
  }

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!user?.id) return
      const response = await fetch(`/api/customers/employee/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
      const data = await response.json()
        const customersData = data.customers || data || []
        setCustomers(customersData)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }


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
        
        // Filter completed camps
        const completed = (campsData || []).filter(camp => camp && camp.status === 'completed')
        setCompletedCamps(completed)
      }
    } catch (error) {
      console.error('Error fetching camps:', error)
      setCamps([])
      setCompletedCamps([])
    }
  }

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!user?.id) return
      const response = await fetch(`/api/cards/employee/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const cardsData = data.cards || data || []
        setCards(cardsData)
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
      setCards([])
    }
  }

  useEffect(() => {
    if (user?.id) {
          fetchCustomers()
          fetchCamps()
      fetchCards()
      fetchEmployeeClaims()
    }
    setLoading(false)
  }, [user])


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
            {/* Dashboard Overview */}
            <div className="mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 sm:p-6 mb-6`}>
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
                    <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h1 className={`text-xl lg:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Welcome back, {user?.name}!</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Here's what's happening with your customers today.</p>
                  </div>
                  
                  {/* Mobile-optimized stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:items-center lg:space-x-8 lg:space-y-0">
                    <div className="flex flex-col items-center p-2 lg:p-0">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <svg className={`w-5 h-5 lg:w-6 lg:h-6 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className={`text-lg lg:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{completedCamps.length}</div>
                      </div>
                      <div className={`text-[10px] lg:text-[11px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center leading-tight`}>Completed Camps</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 lg:p-0">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <svg className={`w-5 h-5 lg:w-6 lg:h-6 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116 0" />
                        </svg>
                        <div className={`text-lg lg:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{customers.length}</div>
                      </div>
                      <div className={`text-[10px] lg:text-[11px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center leading-tight`}>Total Customers</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 lg:p-0">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <svg className={`w-5 h-5 lg:w-6 lg:h-6 ${isDarkMode ? 'text-violet-300' : 'text-violet-600'}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
                          <path d="M3 10h18" />
                        </svg>
                        <div className={`text-lg lg:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cards.length}</div>
                      </div>
                      <div className={`text-[10px] lg:text-[11px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center leading-tight`}>Total Cards</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Type Visualization */}
            <ClaimTypeStatsVisualization claims={claims} isDarkMode={isDarkMode} title="Claim Type Analysis" />

            {/* Financial Metrics */}
            <div className="mt-8 mb-8">
              <FinancialMetrics
                items={[
                  { id: 1, name: 'Total Paid Till Now', value: `₹${totalPaid.toLocaleString()}`, color: 'text-emerald-500', bgColor: 'bg-emerald-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />) },
                  { id: 2, name: 'Pending Cust. Payments', value: `₹${pendingCustomerPayments.toLocaleString()}`, color: 'text-amber-500', bgColor: 'bg-amber-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />) },
                  { id: 3, name: 'Pending Claims Amount', value: `₹${pendingClaimsAmount.toLocaleString()}`, color: 'text-red-500', bgColor: 'bg-red-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) },
                  { id: 4, name: 'Discussed Amount', value: `₹${totalDiscussed.toLocaleString()}`, color: 'text-indigo-500', bgColor: 'bg-indigo-100', Icon: (props) => (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />) }
                ]}
              />
            </div>

            {/* Recent Camps with Maps */}
            <div className="mb-8">
              <RecentCampsMaps camps={camps} title="Recent Camps" onViewMore={() => navigate('/employee/camps')} />
            </div>

            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 sm:mb-6`}>Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/employee/customers')}
                  className="p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Add Customer</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Create new customer</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/employee/camps')}
                  className="p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Upcoming Camps</h3>
                      <p className="text-xs sm:text-sm text-gray-500">View my camps</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/employee/customers')}
                  className="p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">My Customers</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Manage customers</p>
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
