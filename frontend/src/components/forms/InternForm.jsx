import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function InternForm({ onSubmit, onClose, supervisors, courses, lockedSupervisor }) {
  const defaultSupervisorId = lockedSupervisor && supervisors.length === 1 ? String(supervisors[0].id) : ''
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { supervisor_id: defaultSupervisorId },
  })
  const [activeRate, setActiveRate] = useState(null)
  const [rateLoading, setRateLoading] = useState(false)

  const supervisorId = useWatch({ control, name: 'supervisor_id' })
  const courseId = useWatch({ control, name: 'course_id' })

  useEffect(() => {
    if (!supervisorId || !courseId) { setActiveRate(null); return }
    setRateLoading(true)
    api
      .get('/rates/active', { params: { supervisor_id: supervisorId, course_id: courseId } })
      .then(({ data }) => setActiveRate(data))
      .catch(() => setActiveRate(null))
      .finally(() => setRateLoading(false))
  }, [supervisorId, courseId])

  async function submit(data) {
    if (!activeRate) {
      toast.error('No active rate for this supervisor + course. Set one in Negotiated Rates first.')
      return
    }
    try {
      await onSubmit(
        { full_name: data.full_name, school_of_origin: data.school_of_origin, email: data.email || null, phone: data.phone || null },
        { supervisor_id: data.supervisor_id, course_id: data.course_id, start_date: data.start_date, end_date: data.end_date },
      )
      toast.success('Intern registered successfully')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to register intern')
    }
  }

  const rateLabel = rateLoading
    ? 'Fetching rate…'
    : activeRate
    ? `${activeRate.currency} ${Number(activeRate.agreed_amount).toLocaleString()}`
    : supervisorId && courseId
    ? 'No active rate — set one in Negotiated Rates first'
    : 'Select supervisor and course above'

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Intern details</p>

      <div>
        <label className="label">Full name</label>
        <input {...register('full_name', { required: 'Required' })} className={errors.full_name ? 'input-error' : 'input'} />
        {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
      </div>

      <div>
        <label className="label">School of origin</label>
        <input {...register('school_of_origin')} className="input" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Email</label>
          <input type="email" {...register('email')} className="input" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input {...register('phone')} className="input" />
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1">Registration</p>

      <div>
        <label className="label">Supervisor</label>
        <select {...register('supervisor_id', { required: 'Required' })} disabled={lockedSupervisor} className={errors.supervisor_id ? 'input-error' : 'input'}>
          {!lockedSupervisor && <option value="">Select supervisor…</option>}
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
        <label className="label">Amount due — locked at registration</label>
        <div className={`input bg-gray-50 font-medium ${activeRate ? 'text-gray-800' : 'text-gray-400 italic'}`}>
          {rateLabel}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start date</label>
          <input type="date" {...register('start_date', { required: 'Required' })} className={errors.start_date ? 'input-error' : 'input'} />
          {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>}
        </div>
        <div>
          <label className="label">End date</label>
          <input type="date" {...register('end_date', { required: 'Required' })} className={errors.end_date ? 'input-error' : 'input'} />
          {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={isSubmitting || !activeRate} className="btn-primary flex-1">
          {isSubmitting ? 'Registering…' : 'Register intern'}
        </button>
      </div>
    </form>
  )
}
