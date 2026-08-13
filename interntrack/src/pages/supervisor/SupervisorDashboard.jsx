import { useEffect, useState } from 'react'
import { IconUserCheck, IconCreditCard, IconClock, IconAlertCircle } from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MetricCard from '../../components/ui/MetricCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'

export default function SupervisorDashboard() {
  const { profile } = useAuth()
  const [summary, setSummary] = useState([])
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    async function load() {
      const [summaryRes, ratesRes] = await Promise.all([
        supabase.from('intern_payment_summary').select('*'),
        supabase
          .from('supervisor_course_rates')
          .select('*, courses(name)')
          .eq('supervisor_id', profile.id)
          .eq('status', 'active'),
      ])
      setSummary(summaryRes.data || [])
      setRates(ratesRes.data || [])
      setLoading(false)
    }
    load()
  }, [profile?.id])

  const paidCount = summary.filter((r) => r.payment_status === 'paid').length
  const pendingCount = summary.filter((r) => r.payment_status === 'pending').length
  const partialCount = summary.filter((r) => r.payment_status === 'partial').length
  const overdueCount = summary.filter((r) => r.payment_status === 'overdue').length

  const columns = [
    {
      key: 'intern_name',
      label: 'Intern',
      render: (r) => <span className="font-medium text-gray-900">{r.intern_name}</span>,
    },
    { key: 'course_name', label: 'Course' },
    {
      key: 'amount_due',
      label: 'Amount due',
      render: (r) => `RWF ${Number(r.amount_due).toLocaleString()}`,
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (r) => `RWF ${Number(r.balance).toLocaleString()}`,
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (r) => <Badge status={r.payment_status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {profile?.full_name ?? 'Supervisor'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{profile?.school_facility}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="My interns" value={summary.length} icon={IconUserCheck} />
        <MetricCard label="Fully paid" value={paidCount} icon={IconCreditCard} color="success" />
        <MetricCard
          label="Pending / partial"
          value={pendingCount + partialCount}
          icon={IconClock}
          color="warning"
        />
        <MetricCard label="Overdue" value={overdueCount} icon={IconAlertCircle} color="danger" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Intern payment summary</h2>
        <DataTable
          columns={columns}
          data={summary}
          loading={loading}
          emptyMessage="No interns assigned to you yet"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">My negotiated rates</h2>
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-3 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-32" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
          ) : rates.length === 0 ? (
            <p className="px-4 py-5 text-sm text-gray-400">No rates configured yet</p>
          ) : (
            rates.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-700">{r.courses?.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {r.currency} {Number(r.agreed_amount).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
