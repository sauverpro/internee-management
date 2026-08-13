import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function SupervisorForm({ onSubmit, onClose, defaultValues }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      password: '',
      ...defaultValues,
    },
  })

  async function submit(data) {
    try {
      await onSubmit(data)
      toast.success('Supervisor saved')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="label">Full name</label>
        <input {...register('full_name', { required: 'Required' })} className={errors.full_name ? 'input-error' : 'input'} />
        {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
      </div>
      <div>
        <label className="label">School / facility</label>
        <input {...register('school_facility', { required: 'Required' })} className={errors.school_facility ? 'input-error' : 'input'} />
        {errors.school_facility && <p className="mt-1 text-xs text-red-500">{errors.school_facility.message}</p>}
      </div>
      <div>
        <label className="label">Department</label>
        <input {...register('department')} className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" {...register('email', { required: 'Required' })} className={errors.email ? 'input-error' : 'input'} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Phone</label>
        <input {...register('phone')} className="input" />
      </div>
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
        <p className="text-xs font-medium text-gray-700">Login account (optional)</p>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Set password to enable supervisor login"
            {...register('password', { minLength: { value: 6, message: 'Minimum 6 characters' } })}
            className={errors.password ? 'input-error' : 'input'}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          <p className="mt-1 text-xs text-gray-400">Leave blank to create a profile without login access.</p>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : 'Save supervisor'}</button>
      </div>
    </form>
  )
}
