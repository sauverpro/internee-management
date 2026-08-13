import { useEffect, useState } from 'react'
import { IconCreditCard, IconClock, IconAlertCircle } from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import MetricCard from '../../components/ui/MetricCard'
import Badge from '../../components/ui/Badge'

export default function PaymentStatus() {
  const [summary, setSummary] = useState([])
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: regs } = await supabase
        .from('intern_payment_summary')
        .select('*')
        .order('intern_name')

      const rows = regs || []
      setSummary(rows)

      if (rows.length > 0) {
        const ids = rows.map((r) => r.registration_id)
        const { data: commentData } = await supabase
          .from('supervisor_comments')
          .select('registration_id, comment, created_at')
          .in('registration_id', ids)
          .order('created_at', { ascending: false })

        const map = {}
        ;(commentData || []).forEach((c) => {
          if (!map[c.registration_id]) map[c.registration_id] = c.comment
        })
        setComments(map)
      }

      setLoading(false)
    }
    load()
  }, [])

  const paidCount = summary.filter((r) => r.payment_status === 'paid').length
  const pendingCount = summary.filter((r) =>
    r.payment_status === 'pending' || r.payment_status === 'partial',
  ).length
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
      key: 'total_paid',
      label: 'Paid',
      render: (r) => `RWF ${Number(r.total_paid).toLocaleString()}`,
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (r) => (
        <span className={Number(r.balance) > 0 ? 'text-red-600 font-medium' : ''}>
          RWF {Number(r.balance).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (r) => <Badge status={r.payment_status} />,
    },
    {
      key: 'note',
      label: 'Note',
      render: (r) => (
        <span className="text-xs text-gray-500 max-w-[200px] truncate block">
          {comments[r.registration_id] || '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payment status" subtitle="Payment overview for your interns" />

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Fully paid" value={paidCount} icon={IconCreditCard} color="success" />
        <MetricCard
          label="Pending / partial"
          value={pendingCount}
          icon={IconClock}
          color="warning"
        />
        <MetricCard label="Overdue" value={overdueCount} icon={IconAlertCircle} color="danger" />
      </div>

      <DataTable
        columns={columns}
        data={summary}
        loading={loading}
        emptyMessage="No interns assigned to you yet"
      />
    </div>
  )
}
