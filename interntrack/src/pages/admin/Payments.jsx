import { useState, useMemo } from 'react'
import { usePayments } from '../../hooks/usePayments'
import { IconCreditCard, IconAlertCircle, IconChartBar } from '@tabler/icons-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import PaymentForm from '../../components/forms/PaymentForm'
import MetricCard from '../../components/ui/MetricCard'
import Badge from '../../components/ui/Badge'

export default function Payments() {
  const { summary, loading, addPayment } = usePayments()
  const [statusFilter, setStatusFilter] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState('')
  const [selectedReg, setSelectedReg] = useState(null)

  const totalCollected = summary.reduce((acc, r) => acc + Number(r.total_paid || 0), 0)
  const totalOutstanding = summary.reduce((acc, r) => acc + Number(r.balance || 0), 0)
  const totalExpected = summary.reduce((acc, r) => acc + Number(r.amount_due || 0), 0)

  const uniqueSupervisors = useMemo(
    () => [...new Set(summary.map((r) => r.supervisor_name).filter(Boolean))].sort(),
    [summary],
  )

  const filtered = useMemo(() => {
    return summary.filter((r) => {
      if (statusFilter && r.payment_status !== statusFilter) return false
      if (supervisorFilter && r.supervisor_name !== supervisorFilter) return false
      return true
    })
  }, [summary, statusFilter, supervisorFilter])

  const columns = [
    {
      key: 'intern_name',
      label: 'Intern',
      render: (r) => <span className="font-medium text-gray-900">{r.intern_name}</span>,
    },
    { key: 'supervisor_name', label: 'Supervisor' },
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
        <span className={Number(r.balance) > 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
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
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          onClick={() => setSelectedReg(r)}
          className="text-xs text-teal-600 hover:text-teal-800 font-medium hover:underline"
        >
          {r.payment_status === 'paid' ? 'View' : 'Add payment'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="Track and record intern payments" />

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Total collected"
          value={`RWF ${totalCollected.toLocaleString()}`}
          icon={IconCreditCard}
          color="success"
        />
        <MetricCard
          label="Outstanding"
          value={`RWF ${totalOutstanding.toLocaleString()}`}
          icon={IconAlertCircle}
          color="warning"
        />
        <MetricCard
          label="Total expected"
          value={`RWF ${totalExpected.toLocaleString()}`}
          icon={IconChartBar}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ maxWidth: 160 }}
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={supervisorFilter}
          onChange={(e) => setSupervisorFilter(e.target.value)}
          className="input"
          style={{ maxWidth: 220 }}
        >
          <option value="">All supervisors</option>
          {uniqueSupervisors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No payment records found"
      />

      <Modal
        open={!!selectedReg}
        onClose={() => setSelectedReg(null)}
        title="Record payment"
      >
        {selectedReg && (
          <PaymentForm
            registration={selectedReg}
            onSubmit={addPayment}
            onClose={() => setSelectedReg(null)}
          />
        )}
      </Modal>
    </div>
  )
}
