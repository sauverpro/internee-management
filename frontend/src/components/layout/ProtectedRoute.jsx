import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dashboardPathForRole } from '../../lib/roles'

export default function ProtectedRoute({ role, children }) {
  const { user, role: userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (role && userRole !== role) {
    return <Navigate to={dashboardPathForRole(userRole)} replace />
  }

  return children
}
