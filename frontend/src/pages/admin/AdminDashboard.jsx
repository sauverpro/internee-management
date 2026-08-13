import { useEffect, useState } from 'react'
import { IconUserCheck, IconUsers, IconCreditCard, IconAlertCircle } from '@tabler/icons-react'
import api from '../../lib/api'
import MetricCard from '../../components/ui/MetricCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'

export default function AdminDashboard() {
  const [summary, setSummary] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/interns'), api.get('/supervisors')])
      .then(([internRes, svRes]) => {
        setSummary(internRes.data)
        setSupervisors(svRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const paidCount = summary.filter((r) => r.payment_status === 'paid').length
  const unpaidCount = summary.filter((r) => r.payment_status !== 'paid').length
  const outstanding = summary.reduce((acc, r) => acc + Number(r.balance || 0), 0)

  const recentColumns = [
    { key: 'intern_name', label: 'Intern', render: (r) => <span className="font-medium text-gray-900">{r.intern_name}</span> },
    { key: 'course_name', label: 'Course' },
    { key: 'supervisor_name', label: 'Supervisor' },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge status={r.payment_status} /> },
  ]

  const bySupervisor = supervisors
    .map((sv) => {
      const regs = summary.filter((r) => r.supervisor_name === sv.full_name)
      const paid = regs.filter((r) => r.payment_status === 'paid').length
      return { ...sv, total: regs.length, paid, pct: regs.length ? Math.round((paid / regs.length) * 100) : 0 }
    })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of all internship activity</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total interns" value={summary.length} icon={IconUserCheck} />
        <MetricCard label="Supervisors" value={supervisors.length} icon={IconUsers} />
        <MetricCard label="Fully paid" value={paidCount} icon={IconCreditCard} color="success" />
        <MetricCard label="Pending / overdue" value={unpaidCount} sub={`RWF ${outstanding.toLocaleString()} outstanding`} icon={IconAlertCircle} color="warning" />
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent registrations</h2>
          <DataTable columns={recentColumns} data={summary.slice(0, 10)} loading={loading} emptyMessage="No registrations yet" />
        </div>
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Payment by supervisor</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {loading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="space-y-1.5"><div className="h-3 bg-gray-100 rounded animate-pulse w-32" /><div className="h-2 bg-gray-100 rounded animate-pulse" /></div>)}</div>
            ) : bySupervisor.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
            ) : (
              <div className="space-y-4">
                {bySupervisor.map((sv) => (
                  <div key={sv.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[160px]">{sv.full_name}</span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{sv.paid}/{sv.total}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${sv.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
