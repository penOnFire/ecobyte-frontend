import type { FC, ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SignInPage } from '@/pages/SignInPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ScanDevicePage } from '@/pages/ScanDevicePage'
import { AddDetailsPage } from '@/pages/AddDetailsPage'
import { AiDiagnosticPage } from '@/pages/AiDiagnosticPage'
import { ReuseRepairGuidePage } from '@/pages/ReuseRepairGuidePage'
import { ReuseHubPage } from '@/pages/ReuseHubPage'
import { ReuseItemDetailPage } from '@/pages/ReuseItemDetailPage'
import { ConfirmReservationPage } from '@/pages/ConfirmReservationPage'
import { ReservationPassPage } from '@/pages/ReservationPassPage'
import { ProofOfClaimPage } from '@/pages/ProofOfClaimPage'
import { DropOffFinderPage } from '@/pages/DropOffFinderPage'
import { DropoffSchedulerPage } from '@/pages/DropoffSchedulerPage'
import { MyRequestsPage } from '@/pages/MyRequestsPage'
import { AdminShell } from '@/components/layout/AdminShell'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminIncomingDropoffsPage } from '@/pages/admin/AdminIncomingDropoffsPage'
import { AdminToInspectPage } from '@/pages/admin/AdminToInspectPage'
import { AdminPhysicalInspectionPage } from '@/pages/admin/AdminPhysicalInspectionPage'
import { AdminAccessPage } from '@/pages/admin/AdminAccessPage'
import { AdminTransactionsPage } from '@/pages/admin/AdminTransactionsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminActivityLogsPage } from '@/pages/admin/AdminActivityLogsPage'

const RequireAuth: FC<{ children: ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const location = useLocation()
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('ecobyte_token') : null
  if (!token) {
    const target = `${location.pathname}${location.search}`
    return <Navigate to={`/signin?redirect=${encodeURIComponent(target)}`} replace />
  }
  const role =
    typeof window !== 'undefined' ? window.localStorage.getItem('ecobyte_user_role') : null
  const isStaff =
    role === 'ADMIN' || role === 'BARANGAY_OFFICIAL' || role === 'OFFICIAL'
  if (requireAdmin && !isStaff) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

const PreserveQueryRedirect: FC<{ to: string }> = ({ to }) => {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}`} replace />
}

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page & Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Legacy Admin Auth Redirects -> unified /signin */}
        <Route path="/admin/signin" element={<Navigate to="/signin" replace />} />
        <Route path="/admin/login" element={<Navigate to="/signin" replace />} />

        {/* Core Mobile Application Routes (Wrapped in RequireAuth + AppShell) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/scan"
          element={
            <RequireAuth>
              <AppShell>
                <ScanDevicePage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/assess"
          element={
            <RequireAuth>
              <AppShell>
                <AddDetailsPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/diagnostic"
          element={
            <RequireAuth>
              <AppShell>
                <AiDiagnosticPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/reuse-guide"
          element={
            <RequireAuth>
              <AppShell>
                <ReuseRepairGuidePage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/reuse"
          element={
            <RequireAuth>
              <AppShell>
                <ReuseHubPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/reuse/:id"
          element={
            <RequireAuth>
              <AppShell>
                <ReuseItemDetailPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/confirm-reservation"
          element={
            <RequireAuth>
              <AppShell>
                <ConfirmReservationPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/reservation-code"
          element={
            <RequireAuth>
              <AppShell>
                <ReservationPassPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/proof-of-claim"
          element={
            <RequireAuth>
              <AppShell>
                <ProofOfClaimPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route
          path="/drop-offs"
          element={
            <RequireAuth>
              <AppShell>
                <DropOffFinderPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route path="/dropoffs" element={<PreserveQueryRedirect to="/drop-offs" />} />
        <Route path="/drop-off" element={<PreserveQueryRedirect to="/drop-offs" />} />
        <Route path="/dropoff-finder" element={<PreserveQueryRedirect to="/drop-offs" />} />
        <Route
          path="/dropoff-schedule"
          element={
            <RequireAuth>
              <AppShell>
                <DropoffSchedulerPage />
              </AppShell>
            </RequireAuth>
          }
        />
        <Route path="/schedule-dropoff" element={<PreserveQueryRedirect to="/dropoff-schedule" />} />
        <Route path="/schedule-drop-off" element={<PreserveQueryRedirect to="/dropoff-schedule" />} />
        <Route path="/schedule" element={<PreserveQueryRedirect to="/dropoff-schedule" />} />
        <Route path="/assessed" element={<PreserveQueryRedirect to="/requests?tab=assessed" />} />
        <Route path="/assessments" element={<PreserveQueryRedirect to="/requests?tab=assessed" />} />
        <Route
          path="/requests"
          element={
            <RequireAuth>
              <AppShell>
                <MyRequestsPage />
              </AppShell>
            </RequireAuth>
          }
        />

        {/* Desktop Admin Portal Routes (Wrapped in RequireAuth + AdminShell) */}
        <Route
          path="/admin"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminDashboardPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminDashboardPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/incoming"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminIncomingDropoffsPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/to-inspect"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminToInspectPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/inspect"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminToInspectPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/inspect/:id"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminPhysicalInspectionPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/reuse-hub"
          element={<Navigate to="/admin/transactions?tab=reuse" replace />}
        />
        <Route
          path="/admin/disposal"
          element={<Navigate to="/admin/to-inspect?tab=disposal" replace />}
        />
        <Route
          path="/admin/access"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminAccessPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminTransactionsPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminReportsPage />
              </AdminShell>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <RequireAuth requireAdmin>
              <AdminShell>
                <AdminActivityLogsPage />
              </AdminShell>
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
