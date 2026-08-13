import { useEffect, useState } from 'react'
import { IconUsers, IconCreditCard, IconAlertCircle, IconClock } from '@tabler/icons-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import MetricCard from '../../components/ui/MetricCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'

export default function SupervisorDashboard() {
  const { profile } = useAuth()
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/interns')
      .then(({ data }) => setInterns(data))
      .finally(() => setLoading(false))
  }, [])

  const paidCount = interns.filter((r) => r.payment_status === 'paid').length
  const pendingCount = interns.filter((r) => r.payment_status !== 'paid').length
  const outstanding = interns.reduce((acc, r) => acc + Number(r.balance || 0), 0)

  const recentColumns = [
    { key: 'intern_name', label: 'Intern', render: (r) => <div><p className="font-medium text-gray-900">{r.intern_name}</p><p className="text-xs text-gray-400">{r.school_of_origin || '—'}</p></div> },
    { key: 'course_name', label: 'Course' },
    { key: 'duration_weeks', label: 'Duration', render: (r) => `${r.duration_weeks}w` },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge status={r.payment_status} /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {profile?.full_name || 'Supervisor'}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="My interns" value={interns.length} icon={IconUsers} />
        <MetricCard label="Fully paid" value={paidCount} icon={IconCreditCard} color="success" />
        <MetricCard label="Pending / overdue" value={pendingCount} icon={IconAlertCircle} color="warning" />
        <MetricCard label="Outstanding" value={`RWF ${outstanding.toLocaleString()}`} icon={IconClock} color="warning" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">My interns</h2>
        <DataTable columns={recentColumns} data={interns.slice(0, 10)} loading={loading} emptyMessage="No interns assigned yet" />
      </div>
    </div>
  )
}
