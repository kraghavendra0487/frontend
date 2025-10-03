import React from 'react'

// Define the properties (props) that the MapPreview component will accept
const MapPreview = ({ latitude, longitude, mapPageUrl, isDarkMode = false }) => {
  // Construct the URL for the embedded iframe
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`

  return (
    // The main container for the map component
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 w-full max-w-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-xl transition-all duration-300`}>
      {/* Map Preview Section */}
      <div className="w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
        {/* Iframe to embed the Google Map */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title="Google Map Preview"
        >
        </iframe>
        {/* Overlay for better visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
      </div>

      {/* View Full Map Link */}
      <a
        href={mapPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v12a1 1 0 001.707.707L8 12.414V7.586L3.707 3.293zM17.293 3.293L12 7.586v4.828L16.293 16.707a1 1 0 001.414 0l.293-.293A1 1 0 0018 16V4a1 1 0 00-.707-.707z" clipRule="evenodd" />
        </svg>
        View Full Map
      </a>
    </div>
  )
}

export default MapPreview
