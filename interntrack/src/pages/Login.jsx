import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBriefcase } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [tab, setTab] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, role, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect once role is resolved (handles both already-logged-in and post-sign-in)
  useEffect(() => {
    if (!authLoading && role === 'admin') navigate('/admin/dashboard', { replace: true })
    if (!authLoading && role === 'supervisor') navigate('/supervisor/dashboard', { replace: true })
  }, [authLoading, role, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email, password)
      // Navigation happens via useEffect when role resolves
    } catch (err) {
      toast.error(err.message || 'Sign in failed. Check your credentials.')
      setSubmitting(false)
    }
  }

  const busy = submitting || authLoading

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl mb-3 shadow-sm">
            <IconBriefcase size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">InternTrack</h1>
          <p className="mt-1 text-sm text-gray-500">Internship management system</p>
        </div>

        {/* Role tabs */}
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 mb-5 shadow-sm">
          {['admin', 'supervisor'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTab(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                tab === r
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full mt-2">
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Sign in as {tab}. Contact your administrator if you need access.
        </p>
      </div>
    </div>
  )
}
