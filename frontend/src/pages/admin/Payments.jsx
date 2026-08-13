import { useState } from 'react'
import { useInterns } from '../../hooks/useInterns'
import { usePayments } from '../../hooks/usePayments'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import PaymentForm from '../../components/forms/PaymentForm'
import Badge from '../../components/ui/Badge'

export default function Payments() {
  const { interns, loading: internsLoading } = useInterns()
  const { addPayment } = usePayments()
  const [selected, setSelected] = useState(null)

  const columns = [
    { key: 'intern_name', label: 'Intern', render: (r) => <div><p className="font-medium text-gray-900">{r.intern_name}</p><p className="text-xs text-gray-400">{r.school_of_origin || '—'}</p></div> },
    { key: 'course_name', label: 'Course' },
    { key: 'supervisor_name', label: 'Supervisor' },
    { key: 'amount_due', label: 'Amount due', render: (r) => `RWF ${Number(r.amount_due).toLocaleString()}` },
    { key: 'total_paid', label: 'Paid', render: (r) => `RWF ${Number(r.total_paid).toLocaleString()}` },
    { key: 'balance', label: 'Balance', render: (r) => <span className={Number(r.balance) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>{`RWF ${Number(r.balance).toLocaleString()}`}</span> },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge status={r.payment_status} /> },
    {
      key: 'actions', label: '',
      render: (r) => r.payment_status !== 'paid'
        ? <button onClick={() => setSelected(r)} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Record payment</button>
        : null,
    },
  ]

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track and record intern payments" />
      <DataTable columns={columns} data={interns} loading={internsLoading} emptyMessage="No interns registered yet" />
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Record payment">
        {selected && (
          <PaymentForm
            registration={selected}
            onSubmit={addPayment}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
    </div>
  )
}
