const colors = {
  paid:         'bg-green-50 text-green-800',
  partial:      'bg-blue-50 text-blue-800',
  pending:      'bg-amber-50 text-amber-800',
  overdue:      'bg-red-50 text-red-800',
  active:       'bg-teal-50 text-teal-800',
  renegotiated: 'bg-gray-100 text-gray-600',
  completed:    'bg-purple-50 text-purple-800',
  cancelled:    'bg-gray-100 text-gray-500',
  expired:      'bg-orange-50 text-orange-700',
}

export default function Badge({ status }) {
  const cls = colors[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  )
}
