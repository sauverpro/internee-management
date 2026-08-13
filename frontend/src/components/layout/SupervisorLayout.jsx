import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { IconLayoutDashboard, IconUserCheck, IconCreditCard, IconLogout, IconBriefcase } from '@tabler/icons-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

const navGroups = [
  { section: 'My dashboard', items: [
    { label: 'Overview', icon: IconLayoutDashboard, to: '/supervisor/dashboard' },
    { label: 'My interns', icon: IconUserCheck, to: '/supervisor/interns' },
    { label: 'Payment status', icon: IconCreditCard, to: '/supervisor/payments' },
  ]},
]

export default function SupervisorLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="p-1.5 bg-teal-600 rounded-lg"><IconBriefcase size={17} className="text-white" /></div>
          <span className="font-bold text-gray-900 text-sm tracking-wide">InternTrack</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map(({ section, items }) => (
            <div key={section}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{section}</p>
              <div className="space-y-0.5">
                {items.map(({ label, icon: Icon, to }) => (
                  <NavLink key={to} to={to} className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }>
                    <Icon size={17} />{label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar name={profile?.full_name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{profile?.full_name ?? 'Supervisor'}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.school_facility}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <IconLogout size={15} />Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8"><Outlet /></div>
      </main>
    </div>
  )
}
