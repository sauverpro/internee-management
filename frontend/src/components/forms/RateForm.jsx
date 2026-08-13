import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function RateForm({ onSubmit, onClose, supervisors, courses }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function submit(data) {
    try {
      await onSubmit({ supervisor_id: data.supervisor_id, course_id: data.course_id, agreed_amount: Number(data.agreed_amount), notes: data.notes || null })
      toast.success('Rate saved')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save rate')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Note:</strong> Existing intern registrations will NOT be affected — their amount due is already locked.
      </div>
      <div>
        <label className="label">Supervisor</label>
        <select {...register('supervisor_id', { required: 'Required' })} className={errors.supervisor_id ? 'input-error' : 'input'}>
          <option value="">Select supervisor…</option>
          {supervisors.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.school_facility}</option>)}
        </select>
        {errors.supervisor_id && <p className="mt-1 text-xs text-red-500">{errors.supervisor_id.message}</p>}
      </div>
      <div>
        <label className="label">Course</label>
        <select {...register('course_id', { required: 'Required' })} className={errors.course_id ? 'input-error' : 'input'}>
          <option value="">Select course…</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.duration_weeks}w)</option>)}
        </select>
        {errors.course_id && <p className="mt-1 text-xs text-red-500">{errors.course_id.message}</p>}
      </div>
      <div>
        <label className="label">Agreed amount (RWF)</label>
        <input type="number" step="1" min={0} {...register('agreed_amount', { required: 'Required', min: { value: 0, message: 'Must be positive' } })} className={errors.agreed_amount ? 'input-error' : 'input'} placeholder="e.g. 50000" />
        {errors.agreed_amount && <p className="mt-1 text-xs text-red-500">{errors.agreed_amount.message}</p>}
      </div>
      <div>
        <label className="label">Notes (optional)</label>
        <textarea rows={3} {...register('notes')} className="input resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : 'Save rate'}</button>
      </div>
    </form>
  )
}
