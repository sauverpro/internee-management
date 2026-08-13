import { useState, useEffect } from 'react'
import { useInterns } from '../../hooks/useInterns'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'

export default function PaymentStatus() {
  const { interns, loading } = useInterns()
  const [comments, setComments] = useState({})

  useEffect(() => {
    if (!interns.length) return
    const ids = interns.map((r) => r.registration_id).filter(Boolean).join(',')
    if (!ids) return
    api.get('/comments', { params: { registration_ids: ids } })
      .then(({ data }) => {
        const map = {}
        data.forEach((c) => {
          if (!map[c.registration_id]) map[c.registration_id] = []
          map[c.registration_id].push(c)
        })
        setComments(map)
      })
      .catch(() => {})
  }, [interns])

  const columns = [
    { key: 'intern_name', label: 'Intern', render: (r) => <div><p className="font-medium text-gray-900">{r.intern_name}</p><p className="text-xs text-gray-400">{r.school_of_origin || '—'}</p></div> },
    { key: 'course_name', label: 'Course' },
    { key: 'amount_due', label: 'Amount due', render: (r) => `RWF ${Number(r.amount_due).toLocaleString()}` },
    { key: 'total_paid', label: 'Paid', render: (r) => `RWF ${Number(r.total_paid).toLocaleString()}` },
    { key: 'balance', label: 'Balance', render: (r) => <span className={Number(r.balance) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>{`RWF ${Number(r.balance).toLocaleString()}`}</span> },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge status={r.payment_status} /> },
    {
      key: 'latest_note', label: 'Latest note',
      render: (r) => {
        const notes = comments[r.registration_id]
        if (!notes?.length) return <span className="text-gray-400 text-xs">—</span>
        return <span className="text-xs text-gray-600 truncate max-w-[200px] block">{notes[notes.length - 1].comment}</span>
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Payment Status" subtitle="Payment overview for your interns" />
      <DataTable columns={columns} data={interns} loading={loading} emptyMessage="No interns found" />
    </div>
  )
}
