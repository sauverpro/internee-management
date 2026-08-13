export function dashboardPathForRole(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'supervisor') return '/supervisor/dashboard'
  if (role === 'accountant') return '/accountant/dashboard'
  return '/login'
}
