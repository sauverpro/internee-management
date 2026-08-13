import { useState } from 'react'
import { useRates } from '../../hooks/useRates'
import { useSupervisors } from '../../hooks/useSupervisors'
import { useCourses } from '../../hooks/useCourses'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import RateForm from '../../components/forms/RateForm'
import Badge from '../../components/ui/Badge'

export default function NegotiatedRates() {
  const { rates, loading, addRate } = useRates()
  const { supervisors } = useSupervisors()
  const { courses } = useCourses()
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'supervisor_name', label: 'Supervisor', render: (r) => <span className="font-medium text-gray-900">{r.supervisor_name}</span> },
    { key: 'course_name', label: 'Course' },
    { key: 'agreed_amount', label: 'Rate (RWF)', render: (r) => `RWF ${Number(r.agreed_amount).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'effective_from', label: 'Effective', render: (r) => r.effective_from ? new Date(r.effective_from).toLocaleDateString() : '—' },
    { key: 'notes', label: 'Notes', render: (r) => <span className="text-gray-500 text-xs">{r.notes || '—'}</span> },
  ]

  return (
    <div>
      <PageHeader title="Negotiated Rates" subtitle="Supervisor course payment agreements" action={<button onClick={() => setOpen(true)} className="btn-primary">+ Add / renegotiate rate</button>} />
      <DataTable columns={columns} data={rates} loading={loading} emptyMessage="No rates configured yet" />
      <Modal open={open} onClose={() => setOpen(false)} title="Add / renegotiate rate">
        <RateForm onSubmit={addRate} onClose={() => setOpen(false)} supervisors={supervisors} courses={courses} />
      </Modal>
    </div>
  )
}
