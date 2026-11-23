import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Popover, Snackbar, Typography } from '@mui/material'
import { createPortal } from 'react-dom'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import type { User } from '@/types'

type Outcome = 'completed' | 'skipped'

const residentSteps = [
  { target: 'resident-home', title: 'Your dashboard', text: 'Return here for an overview of your requests, assessed items and the latest available devices.' },
  { target: 'resident-scan', title: 'Scan your device', text: 'Choose Scan to photograph the front and back of a device. Add its details and follow the assessment before arranging a drop-off.' },
  { target: 'resident-requests', title: 'Follow your requests', text: 'My Requests shows your ongoing and completed requests. Open a request to check its status and any scheduled drop-off details.' },
  { target: 'resident-reuse', title: 'Find something to reuse', text: 'Browse the Reuse Hub for available items. Open an item to review its condition and reserve it for collection.' },
  { target: 'resident-map', title: 'Find a drop-off hub', text: 'Open the map to explore the Barangay Commonwealth hubs and find a suitable drop-off location.' },
  { target: 'resident-notifications', title: 'Keep up with updates', text: 'The bell shows updates about your requests and reservations. Open it to read your notifications.' },
  { target: 'resident-account', title: 'Your account and this guide', text: 'Open Account to view your profile, sign out, or replay this walkthrough whenever you need it.' },
]
const officialSteps = [
  { target: 'staff-admin', title: 'Your dashboard', text: 'Start here to review activity and the workload for your assigned area.' },
  { target: 'staff-incoming', title: 'Incoming drop-offs', text: 'Review incoming resident requests and scheduled drop-offs. Open a request to see its details and manage intake.' },
  { target: 'staff-to-inspect', title: 'Inspection queue', text: 'Find devices awaiting physical inspection, open an item, and record the inspection outcome.' },
  { target: 'staff-transactions', title: 'Transactions', text: 'Review reuse and disposal activity and follow the records associated with each transaction.' },
  { target: 'staff-account', title: 'Your account', text: 'Open your profile to review your account or replay this guide. Sign out when you finish working.' },
]
const adminSteps = [
  { target: 'staff-admin', title: 'All-barangay overview', text: 'Start here for an overview of activity across the barangay.' },
  { target: 'staff-reports', title: 'Reports and data', text: 'Open reports to review aggregated activity and other operational metrics.' },
  { target: 'staff-transactions', title: 'Overall transactions', text: 'Review transaction records across areas, including reuse and disposal activity.' },
  { target: 'staff-access', title: 'Manage users', text: 'Review accounts and manage staff access according to your responsibilities.' },
  { target: 'staff-activity-logs', title: 'Activity logs', text: 'Review recorded administrative actions and operational activity.' },
  { target: 'staff-account', title: 'Your account', text: 'Open your profile to review your account or replay this guide. Sign out when you finish working.' },
]

interface WalkthroughProps {
  user: User | null
  dashboard: boolean
  staff: boolean
  replay: number
  onStaffMenuChange?: (open: boolean) => void
}

export function Walkthrough({ user, dashboard, staff, replay, onStaffMenuChange }: WalkthroughProps) {
  const navigate = useNavigate()
  const reducedMotion = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [saveFailed, setSaveFailed] = useState(false)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const shown = useRef(new Set<string>())
  const replaySeen = useRef(replay)
  const replaying = useRef(false)
  const steps = staff ? (user?.role?.toUpperCase() === 'ADMIN' ? adminSteps : officialSteps) : residentSteps
  const pendingKey = user?.id ? `ecobyte_walkthrough_pending_${user.id}` : ''
  const isBottomNavigation = Boolean(anchor?.closest('nav[aria-label="Primary mobile navigation"]'))

  useEffect(() => {
    if (!pendingKey) return
    const retry = () => {
      let outcome: string | null = null
      try { outcome = localStorage.getItem(pendingKey) } catch { return }
      if (outcome !== 'completed' && outcome !== 'skipped') return
      authApi.finishWalkthrough(outcome).then(() => {
        try { localStorage.removeItem(pendingKey) } catch { /* storage unavailable */ }
        setSaveFailed(false)
      }).catch(() => setSaveFailed(true))
    }
    retry()
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [pendingKey])

  useEffect(() => {
    if (!user || user.mustChangePassword || user.walkthroughVersion === undefined) return
    if (replay !== replaySeen.current) {
      replaySeen.current = replay
      replaying.current = true
      setStep(0)
      setOpen(true)
      return
    }
    let pending = false
    try { pending = Boolean(localStorage.getItem(pendingKey)) } catch { /* storage unavailable */ }
    if (dashboard && user.walkthroughVersion < 1 && !pending && !shown.current.has(user.id)) {
      shown.current.add(user.id)
      replaying.current = false
      setStep(0)
      setOpen(true)
    }
  }, [user, dashboard, replay, pendingKey])

  useEffect(() => {
    if (!open) return
    const mobileStaff = staff && window.matchMedia('(max-width: 1199px)').matches
    if (mobileStaff) onStaffMenuChange?.(true)
    const locate = () => {
      const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${steps[step].target}"]`)
      const visible = Array.from(candidates).find((element) => {
        const bounds = element.getBoundingClientRect()
        return bounds.width > 0 && bounds.height > 0 && getComputedStyle(element).visibility !== 'hidden'
      }) ?? null
      if (visible) {
        visible.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
        setAnchor(visible)
        setRect(visible.getBoundingClientRect())
      } else {
        setAnchor(null)
        setRect(null)
      }
      setReady(true)
    }
    const timer = window.setTimeout(locate, mobileStaff ? 300 : 0)
    window.addEventListener('resize', locate)
    window.addEventListener('scroll', locate, true)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', locate)
      window.removeEventListener('scroll', locate, true)
    }
  }, [open, step, staff, steps, onStaffMenuChange])

  const finish = (outcome: Outcome, startScan = false) => {
    setOpen(false)
    setReady(false)
    if (staff) onStaffMenuChange?.(false)
    if (!replaying.current && pendingKey) {
      try { localStorage.setItem(pendingKey, outcome) } catch { /* retry on next visit if saving fails */ }
      authApi.finishWalkthrough(outcome).then(() => {
        try { localStorage.removeItem(pendingKey) } catch { /* storage unavailable */ }
        setSaveFailed(false)
      }).catch(() => setSaveFailed(true))
    }
    if (startScan) navigate('/scan')
  }

  return (
    <>
      {open && ready && rect && createPortal(
        <Box aria-hidden="true" sx={{ position: 'fixed', top: rect.top - 5, left: rect.left - 5, width: rect.width + 10, height: rect.height + 10, borderRadius: '14px', border: '3px solid #a9e96d', boxShadow: '0 0 0 9999px rgba(5, 20, 10, 0.72)', pointerEvents: 'none', zIndex: 1399 }} />,
        document.body,
      )}
      <Popover
        open={open && ready}
        anchorEl={anchor}
        anchorReference={anchor ? 'anchorEl' : 'anchorPosition'}
        anchorPosition={anchor ? undefined : { top: window.innerHeight / 2, left: window.innerWidth / 2 }}
        anchorOrigin={{ vertical: isBottomNavigation ? 'top' : 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: anchor ? (isBottomNavigation ? 'bottom' : 'top') : 'center', horizontal: 'center' }}
        onClose={() => finish('skipped')}
        transitionDuration={reducedMotion ? 0 : undefined}
        slotProps={{ backdrop: { invisible: true }, paper: { sx: { width: 'min(360px, calc(100vw - 32px))', borderRadius: '16px', mt: isBottomNavigation ? -1 : anchor ? 1 : 0 } } }}
        sx={{ zIndex: 1400 }}
        role="dialog"
        aria-labelledby="walkthrough-title"
        aria-describedby="walkthrough-description"
      >
        <DialogTitle id="walkthrough-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          {steps[step].title}
          <IconButton aria-label="Close walkthrough" onClick={() => finish('skipped')}><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Step {step + 1} of {steps.length}</Typography>
          <Typography id="walkthrough-description">{steps[step].text}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap' }}>
          <Button onClick={() => finish('skipped')}>Skip</Button>
          <Box sx={{ flex: 1 }} />
          {step > 0 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
          {step < steps.length - 1 ? (
            <Button variant="contained" onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <>
              {!staff && <Button onClick={() => finish('completed', true)}>Start a scan</Button>}
              <Button variant="contained" onClick={() => finish('completed')}>Done</Button>
            </>
          )}
        </DialogActions>
      </Popover>
      <Snackbar open={saveFailed} autoHideDuration={8000} onClose={() => setSaveFailed(false)}>
        <Alert severity="warning" onClose={() => setSaveFailed(false)}>Your guide progress could not be saved. We’ll retry when you reconnect or return.</Alert>
      </Snackbar>
    </>
  )
}
