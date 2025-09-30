import React, { useMemo } from 'react'

export default function RecentCampsMaps({ camps = [], title = 'Recent Camps', onViewMore }) {
  const items = useMemo(() => {
    return (Array.isArray(camps) ? camps : [])
      .filter(c => c && c.camp_date)
      .sort((a, b) => new Date(b.camp_date) - new Date(a.camp_date))
      .slice(0, 3)
  }, [camps])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button onClick={onViewMore} className="text-sm text-blue-600 hover:underline hidden sm:block">View more</button>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((camp) => (
            <div key={camp.id} className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden w-full mx-auto`}>
              <div className="relative">
                <a href={camp.location_link || `https://www.google.com/maps/search/${encodeURIComponent(camp.location)}`} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                  <div className="w-full h-40 sm:h-48 bg-slate-100 relative overflow-hidden">
                    <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(camp.location)}&z=15&output=embed`} title="Camp Location Map" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                  </div>
                </a>
              </div>
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1 truncate">{camp.location}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(camp.camp_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                    (camp.status || '').toLowerCase() === 'planned' ? 'bg-blue-100 text-blue-800' :
                    (camp.status || '').toLowerCase() === 'ongoing' ? 'bg-green-100 text-green-800' :
                    (camp.status || '').toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {(camp.status || 'Unknown').charAt(0).toUpperCase() + (camp.status || 'Unknown').slice(1)}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conducted by</p>
                    <p className="text-gray-800 text-sm">{camp.conducted_by || 'Not specified'}</p>
                  </div>
                  {camp.phone_number && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                      <p className="text-gray-800 text-sm">{camp.phone_number}</p>
                    </div>
                  )}
                  {camp.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">About</p>
                      <p className="text-gray-700 leading-snug text-sm line-clamp-2">{camp.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <a href={camp.location_link || `https://www.google.com/maps/search/${encodeURIComponent(camp.location)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">Open map</a>
                  <span className="text-xs text-gray-400 hidden sm:block">ID: {camp.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">No recent camps.</p>
      )}
    </div>
  )
}


