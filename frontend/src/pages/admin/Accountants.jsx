import { useState } from 'react'
import { useAccountants } from '../../hooks/useAccountants'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import AccountantForm from '../../components/forms/AccountantForm'
import Avatar from '../../components/ui/Avatar'

export default function Accountants() {
  const { accountants, loading, addAccountant } = useAccountants()
  const [open, setOpen] = useState(false)

  const columns = [
    {
      key: 'full_name',
      label: 'Accountant',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.full_name} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{r.full_name}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Login',
      render: () => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">Active</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Accountants"
        subtitle="Create and manage finance team login accounts"
        action={<button onClick={() => setOpen(true)} className="btn-primary">+ Add accountant</button>}
      />
      <DataTable columns={columns} data={accountants} loading={loading} emptyMessage="No accountant accounts yet" />
      <Modal open={open} onClose={() => setOpen(false)} title="Add accountant account">
        <AccountantForm onSubmit={addAccountant} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
