import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconBriefcase } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { dashboardPathForRole } from '../lib/roles'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, role, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect already-logged-in users (based on role)
  useEffect(() => {
    if (authLoading) return
    if (!role) return

    navigate(dashboardPathForRole(role), { replace: true })
  }, [authLoading, role, navigate])


  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { role: newRole } = await signIn(email, password)
      navigate(dashboardPathForRole(newRole), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Sign in failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl mb-3 shadow-sm">
            <IconBriefcase size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">InternTrack</h1>
          <p className="mt-1 text-sm text-gray-500">Internship management system</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" className="input" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Sign in with your email and password. You will be redirected to your dashboard automatically.
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          <Link to="/" className="text-teal-700 hover:underline">← Back to home</Link>
          {' · '}
          <Link to="/#request" className="text-teal-700 hover:underline">Submit enternee request</Link>
        </p>
      </div>
    </div>
  )
}

