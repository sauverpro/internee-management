import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import SupervisorLayout from './components/layout/SupervisorLayout'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import Supervisors from './pages/admin/Supervisors'
import Interns from './pages/admin/Interns'
import Courses from './pages/admin/Courses'
import NegotiatedRates from './pages/admin/NegotiatedRates'
import Payments from './pages/admin/Payments'
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import MyInterns from './pages/supervisor/MyInterns'
import PaymentStatus from './pages/supervisor/PaymentStatus'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="supervisors" element={<Supervisors />} />
            <Route path="interns" element={<Interns />} />
            <Route path="courses" element={<Courses />} />
            <Route path="rates" element={<NegotiatedRates />} />
            <Route path="payments" element={<Payments />} />
          </Route>

          <Route
            path="/supervisor"
            element={
              <ProtectedRoute role="supervisor">
                <SupervisorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SupervisorDashboard />} />
            <Route path="interns" element={<MyInterns />} />
            <Route path="payments" element={<PaymentStatus />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
