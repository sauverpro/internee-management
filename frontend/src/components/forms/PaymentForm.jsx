import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function PaymentForm({ onSubmit, onClose, registration }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { payment_date: new Date().toISOString().split('T')[0], payment_status: 'paid' },
  })

  async function submit(data) {
    try {
      await onSubmit({
        registration_id: registration.registration_id,
        amount_paid: Number(data.amount_paid),
        payment_date: data.payment_date,
        payment_status: data.payment_status,
        receipt_ref: data.receipt_ref || null,
      })
      toast.success('Payment recorded')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to record payment')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {registration && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{registration.intern_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{registration.course_name} · Balance: <span className="font-semibold text-red-600">RWF {Number(registration.balance).toLocaleString()}</span></p>
        </div>
      )}
      <div>
        <label className="label">Amount paid (RWF)</label>
        <input type="number" step="1" min={1} {...register('amount_paid', { required: 'Required', min: { value: 0.01, message: 'Must be greater than 0' } })} className={errors.amount_paid ? 'input-error' : 'input'} />
        {errors.amount_paid && <p className="mt-1 text-xs text-red-500">{errors.amount_paid.message}</p>}
      </div>
      <div>
        <label className="label">Payment date</label>
        <input type="date" {...register('payment_date', { required: 'Required' })} className={errors.payment_date ? 'input-error' : 'input'} />
        {errors.payment_date && <p className="mt-1 text-xs text-red-500">{errors.payment_date.message}</p>}
      </div>
      <div>
        <label className="label">Status</label>
        <select {...register('payment_status')} className="input">
          <option value="paid">Paid (full)</option>
          <option value="partial">Partial</option>
        </select>
      </div>
      <div>
        <label className="label">Receipt reference (optional)</label>
        <input {...register('receipt_ref')} className="input" placeholder="e.g. RCP-2024-001" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Recording…' : 'Record payment'}</button>
      </div>
    </form>
  )
}
