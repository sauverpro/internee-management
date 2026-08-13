import { useState } from 'react'
import { useInterns } from '../../hooks/useInterns'
import { useCourses } from '../../hooks/useCourses'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import InternForm from '../../components/forms/InternForm'
import CommentForm from '../../components/forms/CommentForm'
import Badge from '../../components/ui/Badge'

export default function MyInterns() {
  const { profile } = useAuth()
  const { interns, loading, registerIntern } = useInterns()
  const { courses } = useCourses()
  const [addOpen, setAddOpen] = useState(false)
  const [noteTarget, setNoteTarget] = useState(null)

  const supervisorAsSelf = profile ? [{ id: profile.id, full_name: profile.full_name, school_facility: profile.school_facility }] : []

  const columns = [
    { key: 'intern_name', label: 'Intern', render: (r) => <div><p className="font-medium text-gray-900">{r.intern_name}</p><p className="text-xs text-gray-400">{r.school_of_origin || '—'}</p></div> },
    { key: 'course_name', label: 'Course' },
    { key: 'duration_weeks', label: 'Duration', render: (r) => `${r.duration_weeks}w` },
    { key: 'amount_due', label: 'Amount due', render: (r) => `RWF ${Number(r.amount_due).toLocaleString()}` },
    { key: 'total_paid', label: 'Paid', render: (r) => `RWF ${Number(r.total_paid).toLocaleString()}` },
    { key: 'balance', label: 'Balance', render: (r) => `RWF ${Number(r.balance).toLocaleString()}` },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge status={r.payment_status} /> },
    { key: 'notes', label: '', render: (r) => <button onClick={() => setNoteTarget(r)} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Notes</button> },
  ]

  return (
    <div>
      <PageHeader title="My Interns" subtitle="Interns under your supervision" action={<button onClick={() => setAddOpen(true)} className="btn-primary">+ Register intern</button>} />
      <DataTable columns={columns} data={interns} loading={loading} emptyMessage="No interns assigned yet" />
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Register intern" width="max-w-xl">
        <InternForm onSubmit={registerIntern} onClose={() => setAddOpen(false)} supervisors={supervisorAsSelf} courses={courses} lockedSupervisor />
      </Modal>
      <Modal open={!!noteTarget} onClose={() => setNoteTarget(null)} title="Notes">
        {noteTarget && <CommentForm registration={noteTarget} onClose={() => setNoteTarget(null)} />}
      </Modal>
    </div>
  )
}
