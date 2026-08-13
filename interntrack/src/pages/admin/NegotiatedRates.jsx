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
    {
      key: 'supervisor',
      label: 'Supervisor',
      render: (r) => <span className="font-medium text-gray-900">{r.supervisors?.full_name}</span>,
    },
    {
      key: 'facility',
      label: 'Facility',
      render: (r) => r.supervisors?.school_facility,
    },
    {
      key: 'course',
      label: 'Course',
      render: (r) => r.courses?.name,
    },
    {
      key: 'agreed_amount',
      label: 'Agreed amount',
      render: (r) => (
        <span className="font-semibold text-gray-800">
          {r.currency} {Number(r.agreed_amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'agreed_at',
      label: 'Agreed on',
      render: (r) =>
        new Date(r.agreed_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (r) => (
        <span className="text-xs text-gray-400 max-w-[180px] truncate block">{r.notes || '—'}</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Negotiated rates"
        subtitle="Set payment rates per supervisor and course"
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + Add / renegotiate rate
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={rates}
        loading={loading}
        emptyMessage="No rates configured yet"
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add / renegotiate rate">
        <RateForm
          onSubmit={addRate}
          onClose={() => setOpen(false)}
          supervisors={supervisors}
          courses={courses}
        />
      </Modal>
    </div>
  )
}
