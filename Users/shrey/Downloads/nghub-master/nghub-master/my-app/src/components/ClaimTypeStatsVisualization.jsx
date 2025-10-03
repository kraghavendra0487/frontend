import React from 'react'

/**
 * ClaimTypeStatsVisualization
 * Compact visualization of claim type distribution using small ring charts per type.
 * Props:
 * - claims: Array of claim objects (expects `type_of_claim` field; falls back to `type`)
 * - isDarkMode: boolean to adapt colors
 * - title: optional custom title
 */
export default function ClaimTypeStatsVisualization({ claims = [], isDarkMode = false, title = 'Claim Type Analysis' }) {
  const safeClaims = Array.isArray(claims) ? claims : []

  // Count by claim type (case sensitive as typically stored)
  const claimTypeCounts = safeClaims.reduce((acc, claim) => {
    const type = (claim?.type_of_claim || claim?.type || 'Unknown').trim()
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  // Always display these four types (even when count is zero)
  const DEFAULT_TYPES = [
    'Marriage gift',
    'Maternity benefit',
    'Natural Death',
    'Accidental death'
  ]

  // Bright, lightish colors
  const colorByType = {
    'Marriage gift': '#60a5fa', // blue-400
    'Maternity benefit': '#4ade80', // green-400
    'Natural Death': '#fbbf24', // amber-400
    'Accidental death': '#f87171', // red-400
    'Unknown': '#a78bfa' // violet-400
  }

  const statsArray = DEFAULT_TYPES.map((type) => ({
    type,
    count: claimTypeCounts[type] || 0,
    color: colorByType[type] || colorByType['Unknown']
  }))

  const totalClaims = statsArray.reduce((sum, item) => sum + item.count, 0)

  const calculatePercentage = (count) => {
    if (!totalClaims) return 0
    return (count / totalClaims) * 100
  }

  const RingChart = ({ item }) => {
    const percentage = calculatePercentage(item.count)
    const radius = 16
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const bgStroke = '#e5e7eb'

    return (
      <div className="flex flex-col items-center justify-center p-1 sm:p-2">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16">
          <svg viewBox="0 0 36 36" className="transform -rotate-90">
            <circle cx="18" cy="18" r={radius} fill="transparent" stroke={bgStroke} strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs sm:text-sm font-extrabold text-gray-900`}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        <div className="mt-1 sm:mt-2 text-center">
          <p className={`text-[10px] sm:text-xs font-semibold text-gray-700 leading-tight`}>
            {item.type}
          </p>
          <p className={`text-[10px] sm:text-xs font-bold`} style={{ color: item.color }}>
            ({item.count})
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mb-6`}>
      <div className={`bg-white rounded-xl shadow-sm overflow-hidden p-4 sm:p-6 border border-gray-200`}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center text-gray-900`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {title}
          </h2>
        </div>

        {/* Total Claims - Prominent Display */}
        <div className="text-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Claims</p>
            <p className="text-3xl sm:text-5xl font-extrabold text-purple-600 mb-1">{totalClaims}</p>
            <div className="w-16 h-1 bg-purple-200 rounded-full"></div>
          </div>
        </div>

        {/* Claim Type Charts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 justify-items-center">
          {statsArray.map((item) => (
            <RingChart key={item.type} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}


