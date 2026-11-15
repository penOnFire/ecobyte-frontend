import type { FC } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
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
import { AdminToInspectPage } from '@/pages/admin/AdminToInspectPage'
import { AdminPhysicalInspectionPage } from '@/pages/admin/AdminPhysicalInspectionPage'
import { AdminReuseHubPage } from '@/pages/admin/AdminReuseHubPage'
import { AdminDisposalPage } from '@/pages/admin/AdminDisposalPage'
import { AdminAccessPage } from '@/pages/admin/AdminAccessPage'

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Default Entry: Starts at Login) */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Core Mobile Application Routes (Wrapped in AppShell) */}
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/scan"
          element={
            <AppShell>
              <ScanDevicePage />
            </AppShell>
          }
        />
        <Route
          path="/assess"
          element={
            <AppShell>
              <AddDetailsPage />
            </AppShell>
          }
        />
        <Route
          path="/diagnostic"
          element={
            <AppShell>
              <AiDiagnosticPage />
            </AppShell>
          }
        />
        <Route
          path="/reuse-guide"
          element={
            <AppShell>
              <ReuseRepairGuidePage />
            </AppShell>
          }
        />
        <Route
          path="/reuse"
          element={
            <AppShell>
              <ReuseHubPage />
            </AppShell>
          }
        />
        <Route
          path="/reuse/:id"
          element={
            <AppShell>
              <ReuseItemDetailPage />
            </AppShell>
          }
        />
        <Route
          path="/confirm-reservation"
          element={
            <AppShell>
              <ConfirmReservationPage />
            </AppShell>
          }
        />
        <Route
          path="/reservation-code"
          element={
            <AppShell>
              <ReservationPassPage />
            </AppShell>
          }
        />
        <Route
          path="/proof-of-claim"
          element={
            <AppShell>
              <ProofOfClaimPage />
            </AppShell>
          }
        />
        <Route
          path="/drop-offs"
          element={
            <AppShell>
              <DropOffFinderPage />
            </AppShell>
          }
        />
        <Route path="/dropoffs" element={<Navigate to="/drop-offs" replace />} />
        <Route path="/drop-off" element={<Navigate to="/drop-offs" replace />} />
        <Route path="/dropoff-finder" element={<Navigate to="/drop-offs" replace />} />
        <Route
          path="/dropoff-schedule"
          element={
            <AppShell>
              <DropoffSchedulerPage />
            </AppShell>
          }
        />
        <Route path="/schedule-dropoff" element={<Navigate to="/dropoff-schedule" replace />} />
        <Route path="/schedule-drop-off" element={<Navigate to="/dropoff-schedule" replace />} />
        <Route path="/schedule" element={<Navigate to="/dropoff-schedule" replace />} />
        <Route
          path="/requests"
          element={
            <AppShell>
              <MyRequestsPage />
            </AppShell>
          }
        />

        {/* Desktop Admin Portal Routes (Wrapped in AdminShell) */}
        <Route
          path="/admin"
          element={
            <AdminShell>
              <AdminDashboardPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminShell>
              <AdminDashboardPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/to-inspect"
          element={
            <AdminShell>
              <AdminToInspectPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/inspect"
          element={
            <AdminShell>
              <AdminPhysicalInspectionPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/inspect/:id"
          element={
            <AdminShell>
              <AdminPhysicalInspectionPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/reuse-hub"
          element={
            <AdminShell>
              <AdminReuseHubPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/disposal"
          element={
            <AdminShell>
              <AdminDisposalPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/access"
          element={
            <AdminShell>
              <AdminAccessPage />
            </AdminShell>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
