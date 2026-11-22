import { useEffect, useId, useRef, useState, type FC, type FormEvent } from 'react'
import { Box, Button, IconButton, InputAdornment, OutlinedInput, Typography } from '@mui/material'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { authApi } from '@/lib/api'
import { calculatePasswordStrength } from '@/components/admin/adminAccessData'
import type { User } from '@/types'
import '@/components/auth/ForcePasswordResetModal.css'

interface ForcePasswordResetModalProps {
  open: boolean
  userEmail?: string
  initialCurrentPassword?: string
  onSuccess: (updatedUser: User) => void
  onSignOut: () => void
}

interface ForcePasswordResetFormProps {
  headingId: string
  guardNoticeId: string
  userEmail?: string
  initialCurrentPassword: string
  guardNotice: string | null
  onClearGuardNotice: () => void
  onSuccess: (updatedUser: User) => void
  onSignOut: () => void
}

const ForcePasswordResetForm: FC<ForcePasswordResetFormProps> = ({
  headingId,
  guardNoticeId,
  userEmail,
  initialCurrentPassword,
  guardNotice,
  onClearGuardNotice,
  onSuccess,
  onSignOut,
}) => {
  const [currentPassword, setCurrentPassword] = useState(initialCurrentPassword)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const strength = calculatePasswordStrength(newPassword)
  const hasPrefilledCurrent = Boolean(initialCurrentPassword.trim())

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    onClearGuardNotice()

    const trimmedCurrent = currentPassword.trim()
    const trimmedNew = newPassword.trim()
    const trimmedConfirm = confirmPassword.trim()

    if (!trimmedCurrent) {
      setErrorMessage('Please enter your temporary or current password.')
      return
    }
    if (trimmedNew.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }
    if (trimmedNew === trimmedCurrent) {
      setErrorMessage('New password must be different from your temporary password.')
      return
    }
    if (trimmedNew !== trimmedConfirm) {
      setErrorMessage('New password and confirmation do not match.')
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.changePassword({
        currentPassword: trimmedCurrent,
        newPassword: trimmedNew,
      })
      onSuccess(res.user)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to update your password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '0.85rem',
            backgroundColor: '#f1f4f0',
            border: '1px solid #c5dcba',
            color: '#2e6022',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LockResetRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <h2
            id={headingId}
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.25,
            }}
          >
            Password Update Required
          </h2>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', mt: 0.25 }}>
            {userEmail
              ? `First sign-in security check for ${userEmail}`
              : 'Replace your temporary password before continuing'}
          </Typography>
        </Box>
      </Box>

      {/* Body Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}
      >
        <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
          Your account requires a personal password reset upon sign-in. Choose a new password (at
          least 6 characters) that only you know.
        </Typography>

        {guardNotice && (
          <Box
            id={guardNoticeId}
            role="status"
            sx={{
              p: 1.25,
              borderRadius: '0.75rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {guardNotice}
          </Box>
        )}

        {errorMessage && (
          <Box
            role="alert"
            sx={{
              p: 1.25,
              borderRadius: '0.75rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {errorMessage}
          </Box>
        )}

        {/* Current / Temporary Password */}
        <Box>
          <Typography
            component="label"
            htmlFor="force-reset-current-pw"
            sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.5 }}
          >
            Current or Temporary Password
          </Typography>
          <OutlinedInput
            id="force-reset-current-pw"
            fullWidth
            size="small"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter temporary password"
            autoFocus={!hasPrefilledCurrent}
            autoComplete="current-password"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                  edge="end"
                >
                  {showCurrent ? (
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
            sx={{ borderRadius: '0.75rem', fontFamily: "'Quicksand', sans-serif", fontSize: '0.875rem' }}
          />
        </Box>

        {/* New Password */}
        <Box>
          <Typography
            component="label"
            htmlFor="force-reset-new-pw"
            sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.5 }}
          >
            New Password
          </Typography>
          <OutlinedInput
            id="force-reset-new-pw"
            fullWidth
            size="small"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            autoFocus={hasPrefilledCurrent}
            autoComplete="new-password"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  edge="end"
                >
                  {showNew ? (
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
            sx={{ borderRadius: '0.75rem', fontFamily: "'Quicksand', sans-serif", fontSize: '0.875rem' }}
          />
          {newPassword && (
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  height: 5,
                  borderRadius: 9999,
                  backgroundColor: '#e2e8f0',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${(strength.score / 4) * 100}%`,
                    height: '100%',
                    backgroundColor: strength.color,
                    transition: 'width 0.2s ease, background-color 0.2s ease',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: strength.color }}>
                {strength.label}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Confirm New Password */}
        <Box>
          <Typography
            component="label"
            htmlFor="force-reset-confirm-pw"
            sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.5 }}
          >
            Confirm New Password
          </Typography>
          <OutlinedInput
            id="force-reset-confirm-pw"
            fullWidth
            size="small"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                  edge="end"
                >
                  {showConfirm ? (
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
            sx={{ borderRadius: '0.75rem', fontFamily: "'Quicksand', sans-serif", fontSize: '0.875rem' }}
          />
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            pt: 1.5,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<LogoutRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onSignOut}
            disabled={submitting}
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '0.75rem',
              textTransform: 'none',
            }}
          >
            Sign Out
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: '0.75rem',
              px: 2.5,
              py: 1,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(46, 96, 34, 0.25)',
              '&:hover': { opacity: 0.95 },
            }}
          >
            {submitting ? 'Updating Password…' : 'Update Password & Continue'}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export const ForcePasswordResetModal: FC<ForcePasswordResetModalProps> = ({
  open,
  userEmail,
  initialCurrentPassword = '',
  onSuccess,
  onSignOut,
}) => {
  const headingId = useId()
  const guardNoticeId = useId()
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const [guardNotice, setGuardNotice] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    // Enforce password update when closedby="none" is unsupported (e.g. Safari)
    e.preventDefault()
    setGuardNotice(
      'You must set a new permanent password before continuing, or click Sign Out to cancel.'
    )
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={guardNotice ? guardNoticeId : undefined}
      onCancel={handleCancel}
      className="force-reset-dialog"
      {...({ closedby: 'none' } as Record<string, string>)}
    >
      {open && (
        <ForcePasswordResetForm
          key={`${userEmail || ''}:${initialCurrentPassword}`}
          headingId={headingId}
          guardNoticeId={guardNoticeId}
          userEmail={userEmail}
          initialCurrentPassword={initialCurrentPassword}
          guardNotice={guardNotice}
          onClearGuardNotice={() => setGuardNotice(null)}
          onSuccess={(updatedUser) => {
            setGuardNotice(null)
            dialogRef.current?.close()
            onSuccess(updatedUser)
          }}
          onSignOut={() => {
            setGuardNotice(null)
            dialogRef.current?.close()
            onSignOut()
          }}
        />
      )}
    </dialog>
  )
}
