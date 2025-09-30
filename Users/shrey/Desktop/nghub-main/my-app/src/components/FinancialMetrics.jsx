import React from 'react'

const MetricCard = ({ name, value, color, bgColor, Icon, subtitle }) => {
  return (
    <div className={`relative p-3 sm:p-5 rounded-xl shadow-lg bg-white transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] sm:hover:scale-[1.03] border border-gray-100 overflow-hidden`}>
      <svg className={`absolute top-0 right-0 h-20 w-20 sm:h-28 sm:w-28 opacity-10 transform translate-x-1/4 -translate-y-1/4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <Icon />
      </svg>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-2 sm:p-3 rounded-full ${bgColor} ${color} shadow-md`}>
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <Icon />
          </svg>
        </div>
      </div>
      <div className="flex flex-col mt-1 sm:mt-2">
        <p className="text-xs sm:text-sm font-normal text-gray-500 truncate leading-tight">{name}</p>
        {subtitle && <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{subtitle}</span>}
      </div>
      <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 sm:mt-2 break-all">{value}</p>
    </div>
  )
}

export default function FinancialMetrics({ items = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
      {items.map((it) => (
        <MetricCard key={it.id} name={it.name} value={it.value} color={it.color} bgColor={it.bgColor} Icon={it.Icon} subtitle={it.subtitle} />
      ))}
    </div>
  )
}


