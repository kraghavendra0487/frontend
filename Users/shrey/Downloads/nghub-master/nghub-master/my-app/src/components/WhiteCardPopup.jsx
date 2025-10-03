import { useState, useEffect } from 'react'
import UserCard from './employee/UserCard'

const WhiteCardPopup = ({ isOpen, onClose, card }) => {
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowCard(false)
      const timer = setTimeout(() => {
        setShowCard(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowCard(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Transparent Background */}
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      ></div>
      
      {/* White Box Container - Shifted right to account for navbar */}
      <div className="relative bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4 min-h-[420px] flex items-center justify-center ml-32">
        {/* Card Content - Centered */}
        <div className="w-full flex items-center justify-center">
          {!showCard ? (
            // Loading Message
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Card...</h3>
              <p className="text-gray-600">Please wait while we fetch the card details.</p>
            </div>
          ) : (
            // UserCard inside white box - Perfectly centered
            <UserCard
              cardNumber={card?.card_number || 'N/A'}
              registerNumber={card?.register_number || 'N/A'}
              cardHolderName={card?.card_holder_name || 'N/A'}
              agentName={card?.agent_name || 'N/A'}
              agentMobile={card?.agent_mobile || 'N/A'}
              createdDate={card?.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default WhiteCardPopup
