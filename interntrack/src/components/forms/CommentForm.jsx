import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function CommentForm({ onClose, registration }) {
  const { profile } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm()
  const [existing, setExisting] = useState([])

  useEffect(() => {
    if (!registration?.registration_id) return
    supabase
      .from('supervisor_comments')
      .select('*')
      .eq('registration_id', registration.registration_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setExisting(data || []))
  }, [registration?.registration_id])

  async function submit(data) {
    try {
      const { error } = await supabase.from('supervisor_comments').insert({
        registration_id: registration.registration_id,
        supervisor_id: profile?.id,
        comment: data.comment,
      })
      if (error) throw error
      toast.success('Note saved')
      reset()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save note')
    }
  }

  return (
    <div className="space-y-5">
      {registration && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{registration.intern_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{registration.course_name}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <label className="label">Add note</label>
          <textarea
            rows={4}
            {...register('comment', { required: 'Note cannot be empty' })}
            className="input resize-none"
            placeholder="Write your note here…"
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </form>

      {existing.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Previous notes
          </p>
          <div className="space-y-2">
            {existing.map((c) => (
              <div key={c.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                <p className="text-sm text-gray-700">{c.comment}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
