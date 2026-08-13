const borderMap = {
  default: 'border-gray-200',
  success: 'border-green-200',
  warning: 'border-amber-200',
  danger:  'border-red-200',
}

const iconBgMap = {
  default: 'bg-gray-50 text-gray-400',
  success: 'bg-green-50 text-green-500',
  warning: 'bg-amber-50 text-amber-500',
  danger:  'bg-red-50 text-red-500',
}

export default function MetricCard({ label, value, sub, icon: Icon, color = 'default' }) {
  return (
    <div className={`bg-white rounded-lg p-5 border ${borderMap[color]} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg flex-shrink-0 ${iconBgMap[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}
