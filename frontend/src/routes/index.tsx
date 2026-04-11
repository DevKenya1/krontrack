import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../components/layout/MainLayout'
import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import AttendancePage from '../features/attendance/AttendancePage'
import TimesheetsPage from '../features/timesheets/TimesheetsPage'
import LeavePage from '../features/leave/LeavePage'
import PayrollPage from '../features/payroll/PayrollPage'
import AdminPage from '../features/admin/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'timesheets', element: <TimesheetsPage /> },
      { path: 'leave', element: <LeavePage /> },
      {
        path: 'payroll',
        element: (
          <ProtectedRoute roles={['admin', 'hr', 'manager']}>
            <PayrollPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
