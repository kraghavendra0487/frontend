import { useState, useRef } from 'react'

export default function CardForm({ customerId, customerName, onSuccess, onError, disableAnimations = false }) {
  const [formData, setFormData] = useState({
    card_number: '',
    register_number: '',
    card_holder_name: '',
    agent_name: '',
    agent_mobile: ''
  })
  const [loading, setLoading] = useState(false)
  
  // Ref for 3D effects
  const cardRef = useRef(null)
  const [style, setStyle] = useState({})

  const handleMouseMove = (e) => {
    if (disableAnimations || !cardRef.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    
    const x = (clientX - left - width / 2) / (width / 2)
    const y = (clientY - top - height / 2) / (height / 2)
    const rotateIntensity = 15

    setStyle({
      transform: `perspective(1000px) rotateY(${x * rotateIntensity}deg) rotateX(${-y * rotateIntensity}deg)`,
      '--mouse-x': `${clientX - left}px`,
      '--mouse-y': `${clientY - top}px`,
      '--opacity': '1',
    })
  }

  const handleMouseLeave = () => {
    if (disableAnimations) return
    
    setStyle({
      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
      '--opacity': '0',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, customer_id: customerId })
      })

      const data = await response.json()
      if (response.ok) {
        onSuccess()
      } else {
        onError(data.error || 'Failed to add card')
      }
    } catch (error) {
      onError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="flex justify-center">
      <div
        ref={cardRef}
        onMouseMove={disableAnimations ? undefined : handleMouseMove}
        onMouseLeave={disableAnimations ? undefined : handleMouseLeave}
        style={disableAnimations ? {} : style}
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-700 p-6 text-white shadow-2xl transition-transform duration-100 ease-out"
      >
      {/* Shiny glare effect overlay */}
      {!disableAnimations && (
        <div 
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[var(--opacity)] transition-opacity duration-300"
          style={{
              background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.2), transparent)`
          }}
        />
      )}
      
      {/* Card content */}
      <div className="relative">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-light text-gray-300">Add New Card</p>
          <h2 className="text-lg font-bold">{customerName}</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Card Number *</label>
              <input
                type="text"
                name="card_number"
                value={formData.card_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter card number"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Register Number</label>
              <input
                type="text"
                name="register_number"
                value={formData.register_number}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter register number"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Card Holder Name *</label>
            <input
              type="text"
              name="card_holder_name"
              value={formData.card_holder_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter card holder name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Agent Name</label>
              <input
                type="text"
                name="agent_name"
                value={formData.agent_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter agent name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Agent Mobile</label>
              <input
                type="tel"
                name="agent_mobile"
                value={formData.agent_mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter agent mobile"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => onSuccess()}
              className="px-4 py-2 bg-gray-800 bg-opacity-50 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>{loading ? 'Adding...' : 'Add Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
