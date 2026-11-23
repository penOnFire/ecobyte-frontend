import { useEffect, useState, type FC, type ReactNode } from 'react'
import { apiFetch, ApiErrorResponse } from '@/lib/api/client'
import type { User } from '@/types'
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
import { NotFoundPage } from '@/pages/NotFoundPage'

const RequireAuth: FC<{ children: ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem('ecobyte_token') : null
  const [attempt, setAttempt] = useState(0)
  const [session, setSession] = useState<{
    token: string
    status: 'valid' | 'invalid' | 'unavailable'
    role?: string
  } | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true
    apiFetch<User>('/auth/me')
      .then((user) => {
        if (active) setSession({ token, status: 'valid', role: user.role?.toUpperCase() })
      })
      .catch((error: unknown) => {
        if (active) {
          const invalid = error instanceof ApiErrorResponse && (error.status === 401 || error.status === 403)
          setSession({ token, status: invalid ? 'invalid' : 'unavailable' })
        }
      })
    return () => { active = false }
  }, [token, attempt])

  if (!token || (session?.token === token && session.status === 'invalid')) {
    if (token) localStorage.removeItem('ecobyte_token')
    const target = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/signin?redirect=${encodeURIComponent(target)}&authRequired=1`} replace />
  }
  if (session?.token !== token || !session) {
    return <div role="status">Checking your session…</div>
  }
  if (session.status === 'unavailable') {
    return (
      <main style={{ padding: '2rem' }}>
        <p>Unable to verify your session. Check your connection and try again.</p>
        <button type="button" onClick={() => { setSession(null); setAttempt((value) => value + 1) }}>Try again</button>
      </main>
    )
  }
  const isStaff = session.role === 'ADMIN' || session.role === 'BARANGAY_OFFICIAL' || session.role === 'OFFICIAL'
  if (requireAdmin && !isStaff) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const RequireGuest: FC<{ children: ReactNode }> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ecobyte_token') : null
  const [status, setStatus] = useState<'valid' | 'invalid' | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true
    apiFetch<User>('/auth/me')
      .then((user) => {
        if (active) {
          if (user?.role) localStorage.setItem('ecobyte_user_role', user.role.toUpperCase())
          setStatus('valid')
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const invalid = error instanceof ApiErrorResponse && (error.status === 401 || error.status === 403)
          if (invalid) localStorage.removeItem('ecobyte_token')
          setStatus(invalid ? 'invalid' : 'valid')
        }
      })
    return () => { active = false }
  }, [token])

  if (!token || status === 'invalid') return <>{children}</>
  if (!status) return <div role="status">Checking your session…</div>
  return <Navigate to="/dashboard" replace />
}

const PreserveQueryRedirect: FC<{ to: string }> = ({ to }) => {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}`} replace />
}

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page & Auth Routes (Redirect logged-in users to /dashboard) */}
        <Route path="/" element={<RequireGuest><LandingPage /></RequireGuest>} />
        <Route path="/signin" element={<RequireGuest><SignInPage /></RequireGuest>} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />

        {/* Legacy Admin Auth Redirects -> unified /signin */}
        <Route path="/admin/signin" element={<PreserveQueryRedirect to="/signin" />} />
        <Route path="/admin/login" element={<PreserveQueryRedirect to="/signin" />} />

        {/* Core Mobile Application Routes (Persistent RequireAuth + AppShell) */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scan" element={<ScanDevicePage />} />
          <Route path="/assess" element={<AddDetailsPage />} />
          <Route path="/diagnostic" element={<AiDiagnosticPage />} />
          <Route path="/reuse-guide" element={<ReuseRepairGuidePage />} />
          <Route path="/reuse" element={<ReuseHubPage />} />
          <Route path="/reuse/:id" element={<ReuseItemDetailPage />} />
          <Route path="/confirm-reservation" element={<ConfirmReservationPage />} />
          <Route path="/reservation-code" element={<ReservationPassPage />} />
          <Route path="/proof-of-claim" element={<ProofOfClaimPage />} />
          <Route path="/drop-offs" element={<DropOffFinderPage />} />
          <Route path="/dropoff-schedule" element={<DropoffSchedulerPage />} />
          <Route path="/requests" element={<MyRequestsPage />} />
        </Route>

        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dropoffs" element={<PreserveQueryRedirect to="/drop-offs" />} />
        <Route path="/drop-off" element={<PreserveQueryRedirect to="/drop-offs" />} />
        <Route path="/dropoff-finder" element={<PreserveQueryRedirect to="/drop-offs" />} />
        <Route path="/schedule-dropoff" element={<PreserveQueryRedirect to="/dropoff-schedule" />} />
        <Route path="/schedule-drop-off" element={<PreserveQueryRedirect to="/dropoff-schedule" />} />
        <Route path="/schedule" element={<PreserveQueryRedirect to="/dropoff-schedule" />} />
        <Route path="/assessed" element={<PreserveQueryRedirect to="/requests?tab=assessed" />} />
        <Route path="/assessments" element={<PreserveQueryRedirect to="/requests?tab=assessed" />} />

        {/* Desktop Admin Portal Routes (Persistent RequireAuth + AdminShell) */}
        <Route
          element={
            <RequireAuth requireAdmin>
              <AdminShell />
            </RequireAuth>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/incoming" element={<AdminIncomingDropoffsPage />} />
          <Route path="/admin/to-inspect" element={<AdminToInspectPage />} />
          <Route path="/admin/inspect" element={<AdminToInspectPage />} />
          <Route path="/admin/inspect/:id" element={<AdminPhysicalInspectionPage />} />
          <Route path="/admin/access" element={<AdminAccessPage />} />
          <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
        </Route>

        <Route
          path="/admin/reuse-hub"
          element={<Navigate to="/admin/transactions?tab=reuse" replace />}
        />
        <Route
          path="/admin/disposal"
          element={<Navigate to="/admin/to-inspect?tab=disposal" replace />}
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
