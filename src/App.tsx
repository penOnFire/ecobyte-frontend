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

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Standalone) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Core Mobile Application Routes (Wrapped in AppShell) */}
        <Route
          path="/"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
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
        <Route
          path="/dropoff-schedule"
          element={
            <AppShell>
              <DropoffSchedulerPage />
            </AppShell>
          }
        />
        <Route
          path="/requests"
          element={
            <AppShell>
              <MyRequestsPage />
            </AppShell>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
