import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import CommentForm from '../../components/forms/CommentForm'
import Badge from '../../components/ui/Badge'

export default function MyInterns() {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase
      .from('intern_payment_summary')
      .select('*')
      .order('intern_name')
      .then(({ data }) => {
        setSummary(data || [])
        setLoading(false)
      })
  }, [])

  const columns = [
    {
      key: 'intern_name',
      label: 'Intern',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.intern_name}</p>
          <p className="text-xs text-gray-400">{r.school_of_origin || '—'}</p>
        </div>
      ),
    },
    { key: 'course_name', label: 'Course' },
    {
      key: 'period',
      label: 'Period',
      render: (r) =>
        r.start_date && r.end_date
          ? `${new Date(r.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → ${new Date(r.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
          : '—',
    },
    {
      key: 'amount_due',
      label: 'Amount due',
      render: (r) => `RWF ${Number(r.amount_due).toLocaleString()}`,
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (r) => <Badge status={r.payment_status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          onClick={() => setSelected(r)}
          className="text-xs text-teal-600 hover:text-teal-800 font-medium hover:underline"
        >
          Add note
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="My interns"
        subtitle="Interns assigned to your supervision"
      />

      <DataTable
        columns={columns}
        data={summary}
        loading={loading}
        emptyMessage="No interns assigned to you yet"
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Add note">
        {selected && (
          <CommentForm registration={selected} onClose={() => setSelected(null)} />
        )}
      </Modal>
    </div>
  )
}
