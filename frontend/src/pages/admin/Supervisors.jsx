import { useState } from 'react'
import { useSupervisors } from '../../hooks/useSupervisors'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import SupervisorForm from '../../components/forms/SupervisorForm'
import Avatar from '../../components/ui/Avatar'

export default function Supervisors() {
  const { supervisors, loading, addSupervisor } = useSupervisors()
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'full_name', label: 'Supervisor', render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.full_name} size="sm" />
        <div><p className="font-medium text-gray-900">{r.full_name}</p><p className="text-xs text-gray-400">{r.email}</p></div>
      </div>
    )},
    { key: 'school_facility', label: 'School / Facility' },
    { key: 'department', label: 'Department', render: (r) => r.department || '—' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    {
      key: 'has_login',
      label: 'Login',
      render: (r) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.has_login ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {r.has_login ? 'Enabled' : 'No account'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Supervisors" subtitle="Manage supervisors and create login accounts" action={<button onClick={() => setOpen(true)} className="btn-primary">+ Add supervisor</button>} />
      <DataTable columns={columns} data={supervisors} loading={loading} emptyMessage="No supervisors yet" />
      <Modal open={open} onClose={() => setOpen(false)} title="Add supervisor">
        <SupervisorForm onSubmit={addSupervisor} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
