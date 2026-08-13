import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function CourseForm({ onSubmit, onClose, defaultValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  async function submit(data) {
    try {
      await onSubmit({ ...data, duration_weeks: Number(data.duration_weeks) })
      toast.success('Course saved')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save course')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Prices are set per supervisor via <strong>Negotiated rates</strong> — not here.
      </div>

      <div>
        <label className="label">Course name</label>
        <input
          {...register('name', { required: 'Required' })}
          className={errors.name ? 'input-error' : 'input'}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Duration (weeks)</label>
        <input
          type="number"
          min={1}
          {...register('duration_weeks', { required: 'Required', min: { value: 1, message: 'Min 1 week' } })}
          className={errors.duration_weeks ? 'input-error' : 'input'}
        />
        {errors.duration_weeks && <p className="mt-1 text-xs text-red-500">{errors.duration_weeks.message}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea rows={3} {...register('description')} className="input resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Saving…' : 'Save course'}
        </button>
      </div>
    </form>
  )
}
