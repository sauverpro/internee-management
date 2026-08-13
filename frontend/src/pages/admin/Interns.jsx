import { useState, useMemo } from 'react'
import { useInterns } from '../../hooks/useInterns'
import { useSupervisors } from '../../hooks/useSupervisors'
import { useCourses } from '../../hooks/useCourses'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import InternForm from '../../components/forms/InternForm'
import Badge from '../../components/ui/Badge'

export default function Interns() {
  const { interns, loading, registerIntern } = useInterns()
  const { supervisors } = useSupervisors()
  const { courses } = useCourses()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return interns
    const q = search.toLowerCase()
    return interns.filter((r) =>
      r.intern_name?.toLowerCase().includes(q) ||
      r.course_name?.toLowerCase().includes(q) ||
      r.supervisor_name?.toLowerCase().includes(q) ||
      r.school_of_origin?.toLowerCase().includes(q),
    )
  }, [interns, search])

  const columns = [
    { key: 'intern_name', label: 'Intern', render: (r) => <div><p className="font-medium text-gray-900">{r.intern_name}</p><p className="text-xs text-gray-400">{r.school_of_origin || '—'}</p></div> },
    { key: 'course_name', label: 'Course' },
    { key: 'supervisor_name', label: 'Supervisor' },
    { key: 'duration_weeks', label: 'Duration', render: (r) => `${r.duration_weeks}w` },
    { key: 'amount_due', label: 'Amount due', render: (r) => `RWF ${Number(r.amount_due).toLocaleString()}` },
    { key: 'total_paid', label: 'Paid', render: (r) => `RWF ${Number(r.total_paid).toLocaleString()}` },
    { key: 'balance', label: 'Balance', render: (r) => `RWF ${Number(r.balance).toLocaleString()}` },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge status={r.payment_status} /> },
  ]

  return (
    <div>
      <PageHeader title="Interns" subtitle="Register and track all interns" action={<button onClick={() => setOpen(true)} className="btn-primary">+ Register intern</button>} />
      <div className="mb-4"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search intern, course, supervisor…" className="input max-w-sm" /></div>
      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No interns found" />
      <Modal open={open} onClose={() => setOpen(false)} title="Register intern" width="max-w-xl">
        <InternForm onSubmit={registerIntern} onClose={() => setOpen(false)} supervisors={supervisors} courses={courses} />
      </Modal>
    </div>
  )
}
