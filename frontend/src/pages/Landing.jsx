import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  IconBriefcase,
  IconUsers,
  IconCreditCard,
  IconClipboardCheck,
  IconSchool,
  IconArrowRight,
  IconLogin,
  IconFileText,
  IconShieldCheck,
  IconChartBar,
} from '@tabler/icons-react'
import api from '../lib/api'

const features = [
  {
    icon: IconUsers,
    title: 'Supervisor management',
    description: 'Assign supervisors, track intern placements, and manage negotiated course rates in one place.',
  },
  {
    icon: IconCreditCard,
    title: 'Finance & payments',
    description: 'Accountants record payments, monitor balances, and generate daily, weekly, and monthly reports.',
  },
  {
    icon: IconClipboardCheck,
    title: 'Intern tracking',
    description: 'Register enternees, follow internship progress, and keep payment status up to date.',
  },
  {
    icon: IconShieldCheck,
    title: 'Role-based access',
    description: 'Admins, supervisors, and accountants each get a dashboard tailored to their responsibilities.',
  },
]

const steps = [
  { step: '1', title: 'Submit your request', text: 'Fill in the enternee form with your details, preferred supervisor, and course dates.' },
  { step: '2', title: 'Admin review', text: 'Your request is registered with the active supervisor rate for your chosen course.' },
  { step: '3', title: 'Start internship', text: 'Your supervisor tracks your placement while finance handles payment records.' },
]

function scrollToRequest() {
  document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Landing() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      school_of_origin: '',
      supervisor_id: '',
      course_id: '',
      start_date: '',
      end_date: '',
    },
  })

  const [supervisors, setSupervisors] = useState([])
  const [courses, setCourses] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingOptions(true)
      try {
        const [svRes, cRes] = await Promise.all([
          api.get('/public/supervisors'),
          api.get('/public/courses'),
        ])
        setSupervisors(svRes.data)
        setCourses(cRes.data)
      } catch {
        toast.error('Could not load supervisors or courses')
      } finally {
        setLoadingOptions(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (window.location.hash === '#request') {
      setTimeout(scrollToRequest, 100)
    }
  }, [])

  const canSubmit = Boolean(
    watch('full_name') &&
    watch('supervisor_id') &&
    watch('course_id') &&
    watch('start_date') &&
    watch('end_date'),
  )

  const onSubmit = async (data) => {
    try {
      await api.post('/public/internship-request', {
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone || null,
        school_of_origin: data.school_of_origin || null,
        supervisor_id: data.supervisor_id,
        course_id: data.course_id,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      toast.success('Internship request submitted successfully!')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Submission failed')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-teal-600 rounded-lg">
              <IconBriefcase size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">InternTrack</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors">How it works</a>
            <button type="button" onClick={scrollToRequest} className="hover:text-teal-700 transition-colors">
              Enternee request
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary flex items-center gap-1.5 px-3 py-2">
              <IconLogin size={16} />
              Login
            </Link>
            <button type="button" onClick={scrollToRequest} className="btn-primary hidden sm:flex items-center gap-1.5">
              Apply now
              <IconArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">
                Internship management platform
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Manage enternees, supervisors &amp; finance in one system
              </h1>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                InternTrack helps hospitals and training facilities register internship requests,
                assign supervisors, and track payments — from student application to final settlement.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={scrollToRequest} className="btn-primary flex items-center gap-2 px-5 py-3">
                  <IconFileText size={18} />
                  Submit enternee request
                </button>
                <Link to="/login" className="btn-secondary flex items-center gap-2 px-5 py-3">
                  <IconLogin size={18} />
                  Staff login
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><IconSchool size={16} /> Student requests</span>
                <span className="flex items-center gap-1.5"><IconChartBar size={16} /> Finance reports</span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Quick overview</h2>
                <p className="text-sm text-gray-500 mb-6">Everything your facility needs to run internships</p>
                <ul className="space-y-4">
                  {[
                    'Students submit internship requests online',
                    'Admins register supervisors and set course rates',
                    'Supervisors track their assigned enternees',
                    'Accountants record payments and view reports',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Built for every role</h2>
            <p className="mt-3 text-gray-600">
              From the landing page request to daily finance reports, InternTrack covers the full internship lifecycle.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-3 text-gray-600">Three simple steps from application to active internship.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, text }) => (
              <div key={step} className="text-center">
                <div className="inline-flex w-12 h-12 rounded-full bg-teal-600 text-white font-bold text-lg items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="request" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Enternee internship request</h2>
            <p className="mt-3 text-gray-600">
              Submit your details below. We will register you and match you with an active supervisor rate.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Full name *</label>
                <input
                  className={errors.full_name ? 'input-error input' : 'input'}
                  placeholder="Your full name"
                  {...register('full_name', { required: 'Required' })}
                />
                {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="you@example.com" {...register('email')} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="Phone number" {...register('phone')} />
                </div>
              </div>

              <div>
                <label className="label">School of origin</label>
                <input className="input" placeholder="University / College" {...register('school_of_origin')} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Supervisor *</label>
                  <select className={errors.supervisor_id ? 'input-error input' : 'input'} {...register('supervisor_id', { required: 'Required' })}>
                    <option value="">{loadingOptions ? 'Loading…' : supervisors.length ? 'Select supervisor…' : 'No supervisors available'}</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name} — {s.school_facility}</option>
                    ))}
                  </select>
                  {errors.supervisor_id && <p className="mt-1 text-xs text-red-500">{errors.supervisor_id.message}</p>}
                </div>
                <div>
                  <label className="label">Course *</label>
                  <select className={errors.course_id ? 'input-error input' : 'input'} {...register('course_id', { required: 'Required' })}>
                    <option value="">{loadingOptions ? 'Loading…' : courses.length ? 'Select course…' : 'No courses available'}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.duration_weeks}w)</option>
                    ))}
                  </select>
                  {errors.course_id && <p className="mt-1 text-xs text-red-500">{errors.course_id.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Start date *</label>
                  <input type="date" className={errors.start_date ? 'input-error input' : 'input'} {...register('start_date', { required: 'Required' })} />
                  {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>}
                </div>
                <div>
                  <label className="label">End date *</label>
                  <input type="date" className={errors.end_date ? 'input-error input' : 'input'} {...register('end_date', { required: 'Required' })} />
                  {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date.message}</p>}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !canSubmit} className="btn-primary w-full py-3 mt-2">
                {isSubmitting ? 'Submitting…' : 'Submit internship request'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you request an internship registration with an active supervisor rate.
                Already staff? <Link to="/login" className="text-teal-700 hover:underline">Sign in here</Link>.
              </p>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-teal-600 rounded-lg">
              <IconBriefcase size={16} className="text-white" />
            </div>
            <span className="font-semibold text-white">InternTrack</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <button type="button" onClick={scrollToRequest} className="hover:text-white transition-colors">Enternee request</button>
            <Link to="/login" className="hover:text-white transition-colors">Staff login</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} InternTrack. Internship management system.</p>
        </div>
      </footer>
    </div>
  )
}
