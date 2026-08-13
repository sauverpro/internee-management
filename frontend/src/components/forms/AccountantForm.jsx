import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function AccountantForm({ onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
    },
  })

  async function submit(data) {
    try {
      await onSubmit(data)
      toast.success('Accountant account created')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to create account')
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
        <label className="label">Email</label>
        <input type="email" {...register('email', { required: 'Required' })} className={errors.email ? 'input-error' : 'input'} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Password</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('password', { required: 'Required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          className={errors.password ? 'input-error' : 'input'}
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Creating…' : 'Create accountant'}</button>
      </div>
    </form>
  )
}
