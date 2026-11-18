import type { FC } from 'react'
import { Box, ButtonBase, IconButton, Typography } from '@mui/material'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  COMMONWEALTH_FACILITIES,
  calculatePasswordStrength,
} from '@/components/admin/adminAccessData'
import type { OfficialUser, UserStatus } from '@/components/admin/adminAccessData'

interface AdminAccessEditorPanelProps {
  selectedUser: OfficialUser | null
  isSaving: boolean
  formFirstName: string
  formMiddleName: string
  formLastName: string
  formSuffix: string
  formEmail: string
  formPhone: string
  formIdCode: string
  formRole: 'Admin' | 'Official'
  formDepartment: string
  formStatus: UserStatus
  formTwoFactor: boolean
  formMustChangePassword: boolean
  formPassword: string
  formConfirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  formNotes: string
  validationErrors: Record<string, string>
  onClose?: () => void
  onResetForm: () => void
  onFirstNameChange: (v: string) => void
  onMiddleNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onSuffixChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onIdCodeChange: (v: string) => void
  onRegenerateBadge: () => void
  onRoleChange: (role: 'Admin' | 'Official') => void
  onDepartmentChange: (v: string) => void
  onStatusChange: (status: UserStatus) => void
  onGeneratePassword: () => void
  onPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
  onToggleShowPassword: () => void
  onToggleShowConfirmPassword: () => void
  onMustChangePasswordChange: (v: boolean) => void
  onTwoFactorChange: (v: boolean) => void
  onNotesChange: (v: string) => void
  onSave: () => void
  onDeactivate: () => void
  onReactivate: () => void
}

export const AdminAccessEditorPanel: FC<AdminAccessEditorPanelProps> = ({
  selectedUser,
  isSaving,
  formFirstName,
  formMiddleName,
  formLastName,
  formSuffix,
  formEmail,
  formPhone,
  formIdCode,
  formRole,
  formDepartment,
  formStatus,
  formTwoFactor,
  formMustChangePassword,
  formPassword,
  formConfirmPassword,
  showPassword,
  showConfirmPassword,
  formNotes,
  validationErrors,
  onClose,
  onResetForm,
  onFirstNameChange,
  onMiddleNameChange,
  onLastNameChange,
  onSuffixChange,
  onEmailChange,
  onPhoneChange,
  onIdCodeChange,
  onRegenerateBadge,
  onRoleChange,
  onDepartmentChange,
  onStatusChange,
  onGeneratePassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onMustChangePasswordChange,
  onTwoFactorChange,
  onNotesChange,
  onSave,
  onDeactivate,
  onReactivate,
}) => {
  const passwordStrength = calculatePasswordStrength(formPassword)
  const isPasswordsMatching = Boolean(
    formPassword && formConfirmPassword && formPassword === formConfirmPassword,
  )
  const isPasswordsMismatch = Boolean(
    formConfirmPassword && formPassword !== formConfirmPassword,
  )

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: { xs: 'none', lg: 'calc(100vh - 140px)' },
        position: { xs: 'static', lg: 'sticky' },
        top: { xs: 'auto', lg: 24 },
        overflow: 'hidden',
      }}
    >
      {/* Header - Fixed Top */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
          backgroundColor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: '#16a34a',
                textTransform: 'uppercase',
              }}
            >
              {selectedUser ? 'Identity Modification' : 'Credential Enrollment'}
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedUser ? `Edit ${selectedUser.name}` : 'Enroll New Official'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ButtonBase
              onClick={onResetForm}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                '&:hover': { backgroundColor: '#e2e8f0' },
              }}
              title="Reset Form / Clear Selection"
            >
              <PersonAddRoundedIcon sx={{ fontSize: 16 }} />
              <span>New Official</span>
            </ButtonBase>
            {onClose && (
              <IconButton
                size="small"
                onClick={onClose}
                aria-label="Close drawer"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  '&:hover': { backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Self demotion warning */}
        {selectedUser?.isSelf && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 18, color: '#dc2626', mt: 0.25 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.3 }}>
              <strong>Protected Session Constraint:</strong> You are currently logged in with this
              account. You cannot demote or deactivate your own account.
            </Typography>
          </Box>
        )}
      </Box>

      {/* SCROLLABLE INNER BODY */}
      <Box
        sx={{
          p: 3,
          pt: 2.5,
          pb: 2.5,
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { backgroundColor: '#f8fafc' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#94a3b8' },
        }}
      >
        {/* SECTION 1: Personal & Contact Information */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            1. Personal &amp; Contact Information
          </Typography>

          {/* Row 1: First Name & Middle Name */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                First Name <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <PersonOutlineRoundedIcon
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: 18,
                  }}
                />
                <input
                  type="text"
                  value={formFirstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  placeholder="e.g. Kenneth"
                  style={{
                    width: '100%',
                    height: 40,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 8,
                    border: `1px solid ${validationErrors.firstName ? '#ef4444' : '#cbd5e1'}`,
                    backgroundColor: '#f8fafc',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </Box>
              {validationErrors.firstName && (
                <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                  {validationErrors.firstName}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Middle Name{' '}
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>
                  (Optional)
                </span>
              </Typography>
              <input
                type="text"
                value={formMiddleName}
                onChange={(e) => onMiddleNameChange(e.target.value)}
                placeholder="e.g. Paul"
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </Box>
          </Box>

          {/* Row 2: Last Name & Suffix */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Last Name <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <PersonOutlineRoundedIcon
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: 18,
                  }}
                />
                <input
                  type="text"
                  value={formLastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  placeholder="e.g. Adams"
                  style={{
                    width: '100%',
                    height: 40,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 8,
                    border: `1px solid ${validationErrors.lastName ? '#ef4444' : '#cbd5e1'}`,
                    backgroundColor: '#f8fafc',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </Box>
              {validationErrors.lastName && (
                <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                  {validationErrors.lastName}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Suffix{' '}
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>
                  (e.g. Jr, III)
                </span>
              </Typography>
              <input
                type="text"
                value={formSuffix}
                onChange={(e) => onSuffixChange(e.target.value)}
                placeholder="Jr., Sr., III"
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </Box>
          </Box>

          {/* Email Address & Phone Number Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Official Email <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <MailOutlineRoundedIcon
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: 18,
                  }}
                />
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="official@ecobyte.gov"
                  style={{
                    width: '100%',
                    height: 40,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 8,
                    border: `1px solid ${validationErrors.email ? '#ef4444' : '#cbd5e1'}`,
                    backgroundColor: '#f8fafc',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </Box>
              {validationErrors.email && (
                <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                  {validationErrors.email}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Mobile / Contact <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <PhoneRoundedIcon
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: 18,
                  }}
                />
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  style={{
                    width: '100%',
                    height: 40,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 8,
                    border: `1px solid ${validationErrors.phone ? '#ef4444' : '#cbd5e1'}`,
                    backgroundColor: '#f8fafc',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </Box>
              {validationErrors.phone && (
                <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                  {validationErrors.phone}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Official Badge ID Code */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Badge / Employee ID <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <ButtonBase
                onClick={onRegenerateBadge}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#16a34a',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 13 }} />
                <span>Generate New ID</span>
              </ButtonBase>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <BadgeOutlinedIcon
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: 18,
                }}
              />
              <input
                type="text"
                value={formIdCode}
                onChange={(e) => onIdCodeChange(e.target.value)}
                placeholder="ID-0000-OFC"
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 38,
                  paddingRight: 12,
                  borderRadius: 8,
                  border: `1px solid ${validationErrors.idCode ? '#ef4444' : '#cbd5e1'}`,
                  backgroundColor: '#f8fafc',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* SECTION 2: Role, Assignment & Facility */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            2. Role &amp; Facility Assignment
          </Typography>

          {/* Role Selection Tabs */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Assigned Authority Role
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 700 }}>
                {formRole === 'Admin'
                  ? 'Super Admin Privileges'
                  : 'Triage, Inspect & Log E-Waste'}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                p: 0.5,
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
              }}
            >
              <ButtonBase
                onClick={() => onRoleChange('Official')}
                disabled={selectedUser?.isSelf}
                sx={{
                  flex: 1,
                  py: 1.1,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: formRole === 'Official' ? '#006a61' : 'transparent',
                  color: formRole === 'Official' ? '#ffffff' : '#475569',
                  boxShadow: formRole === 'Official' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Official</span>
              </ButtonBase>

              <ButtonBase
                onClick={() => onRoleChange('Admin')}
                sx={{
                  flex: 1,
                  py: 1.1,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: formRole === 'Admin' ? '#16a34a' : 'transparent',
                  color: formRole === 'Admin' ? '#ffffff' : '#475569',
                  boxShadow: formRole === 'Admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                <ShieldRoundedIcon sx={{ fontSize: 16 }} />
                <span>Admin</span>
              </ButtonBase>
            </Box>
          </Box>

          {/* Assigned Facility Dropdown */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              Assigned Barangay Facility / Sector
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <BusinessRoundedIcon
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: 18,
                  pointerEvents: 'none',
                }}
              />
              <select
                value={formDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 38,
                  paddingRight: 12,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {COMMONWEALTH_FACILITIES.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Account Status Selection */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              Account Operational Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['Active', 'Suspended', 'Deactivated'] as UserStatus[]).map((st) => {
                const isCurrent = formStatus === st
                return (
                  <ButtonBase
                    key={st}
                    onClick={() => onStatusChange(st)}
                    disabled={selectedUser?.isSelf && st !== 'Active'}
                    sx={{
                      flex: 1,
                      py: 0.75,
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: isCurrent
                        ? st === 'Active'
                          ? '#dcfce7'
                          : st === 'Suspended'
                            ? '#fef3c7'
                            : '#fee2e2'
                        : '#f8fafc',
                      color: isCurrent
                        ? st === 'Active'
                          ? '#15803d'
                          : st === 'Suspended'
                            ? '#b45309'
                            : '#dc2626'
                        : '#64748b',
                      border: '1px solid',
                      borderColor: isCurrent
                        ? st === 'Active'
                          ? '#86efac'
                          : st === 'Suspended'
                            ? '#fcd34d'
                            : '#fca5a5'
                        : '#e2e8f0',
                    }}
                  >
                    {st}
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>
        </Box>

        {/* SECTION 3: Security Credentials & Passwords */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              3. Security &amp; Passwords
            </Typography>
            <ButtonBase
              onClick={onGeneratePassword}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.4,
                borderRadius: '6px',
                backgroundColor: '#eff4ff',
                color: '#1d4ed8',
                fontSize: '0.6875rem',
                fontWeight: 700,
                border: '1px solid #bfdbfe',
                '&:hover': { backgroundColor: '#dbeafe' },
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
              <span>Auto-Generate Password</span>
            </ButtonBase>
          </Box>

          {/* Password Input Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                {selectedUser
                  ? 'New Password (leave blank to retain current)'
                  : 'Account Password *'}
              </Typography>
              {formPassword && (
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: passwordStrength.color,
                  }}
                >
                  Strength: {passwordStrength.label}
                </Typography>
              )}
            </Box>
            <Box sx={{ position: 'relative' }}>
              <KeyRoundedIcon
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: 18,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder={
                  selectedUser
                    ? '••••••••  (Leave blank if unchanged)'
                    : 'Enter strong password (min 8 chars)'
                }
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 38,
                  paddingRight: 40,
                  borderRadius: 8,
                  border: `1px solid ${validationErrors.password ? '#ef4444' : '#cbd5e1'}`,
                  backgroundColor: '#f8fafc',
                  fontFamily: showPassword ? "'Rethink Sans', 'Inter', sans-serif" : 'monospace',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <ButtonBase
                onClick={onToggleShowPassword}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  p: 0.5,
                  borderRadius: '4px',
                  color: '#64748b',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                )}
              </ButtonBase>
            </Box>
            {validationErrors.password && (
              <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                {validationErrors.password}
              </Typography>
            )}

            {formPassword && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {[1, 2, 3, 4].map((step) => (
                  <Box
                    key={step}
                    sx={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        step <= passwordStrength.score ? passwordStrength.color : '#e2e8f0',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Confirm Password Input Field */}
          {(formPassword || !selectedUser) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  Confirm Password
                </Typography>
                {isPasswordsMatching && (
                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                    }}
                  >
                    <CheckRoundedIcon sx={{ fontSize: 13 }} />
                    <span>Passwords match</span>
                  </Typography>
                )}
                {isPasswordsMismatch && (
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626' }}>
                    Passwords do not match
                  </Typography>
                )}
              </Box>
              <Box sx={{ position: 'relative' }}>
                <LockOutlinedIcon
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: 18,
                  }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formConfirmPassword}
                  onChange={(e) => onConfirmPasswordChange(e.target.value)}
                  placeholder="Repeat password to verify"
                  style={{
                    width: '100%',
                    height: 40,
                    paddingLeft: 38,
                    paddingRight: 40,
                    borderRadius: 8,
                    border: `1px solid ${validationErrors.confirmPassword || isPasswordsMismatch ? '#ef4444' : '#cbd5e1'}`,
                    backgroundColor: '#f8fafc',
                    fontFamily: showConfirmPassword
                      ? "'Rethink Sans', 'Inter', sans-serif"
                      : 'monospace',
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
                <ButtonBase
                  onClick={onToggleShowConfirmPassword}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    p: 0.5,
                    borderRadius: '4px',
                    color: '#64748b',
                  }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                </ButtonBase>
              </Box>
              {validationErrors.confirmPassword && (
                <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                  {validationErrors.confirmPassword}
                </Typography>
              )}
            </Box>
          )}

          {/* Checkbox Options */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={formMustChangePassword}
                onChange={(e) => onMustChangePasswordChange(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                Require password reset upon first official sign-in
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={formTwoFactor}
                onChange={(e) => onTwoFactorChange(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                Enforce Two-Factor Authentication (SMS OTP / Authenticator App)
              </span>
            </label>
          </Box>
        </Box>

        {/* SECTION 4: Administrative Notes */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            pt: 1,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
            Administrative Notes &amp; Scope Justification
          </Typography>
          <textarea
            value={formNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Assigned to morning intake triage at Commonwealth MRF; clearance issued by Brgy Captain."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              fontSize: '0.8125rem',
              color: '#0f172a',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </Box>

        {/* Scope Overview Box */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '8px',
            backgroundColor: '#eff4ff',
            border: '1px solid #dce9ff',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
            }}
          >
            Assigned Permissions Scope
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#0f172a', mt: 0.5, lineHeight: 1.4 }}>
            {formRole === 'Admin'
              ? 'Full administrative governance, RBAC management, downstream manifest signing, credential provisioning, and compliance auditing.'
              : 'Authorized to inspect incoming e-waste, record battery diagnostics, assign condition grades, and mark units ready for Reuse Hub.'}
          </Typography>
        </Box>
      </Box>

      {/* LOCKED FOOTER & ACTION BUTTONS */}
      <Box
        sx={{
          p: 2.5,
          pt: 2,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <ButtonBase
          onClick={onSave}
          disabled={isSaving}
          sx={{
            width: '100%',
            height: 44,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgb(22, 163, 74) 0%, rgb(34, 197, 94) 100%)',
            color: '#ffffff',
            fontFamily: "'Rethink Sans', 'Inter', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            opacity: isSaving ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
            '&:hover': { opacity: 0.95 },
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
          <span>
            {isSaving
              ? 'Saving Changes...'
              : selectedUser
                ? 'Save & Update Identity'
                : 'Enroll Official & Issue Credentials'}
          </span>
        </ButtonBase>

        {selectedUser && !selectedUser.isSelf && selectedUser.role !== 'Deactivated' && (
          <ButtonBase
            onClick={onDeactivate}
            disabled={isSaving}
            sx={{
              width: '100%',
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': { backgroundColor: '#fecaca' },
            }}
          >
            <PersonOffOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Deactivate Identity &amp; Revoke Credentials</span>
          </ButtonBase>
        )}

        {selectedUser && selectedUser.role === 'Deactivated' && (
          <ButtonBase
            onClick={onReactivate}
            disabled={isSaving}
            sx={{
              width: '100%',
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': { backgroundColor: '#bbf7d0' },
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
            <span>Reactivate Official &amp; Issue Fresh Badge</span>
          </ButtonBase>
        )}

        {/* Compliance Note */}
        <Box
          sx={{
            pt: 1,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            color: '#64748b',
          }}
        >
          <span style={{ fontStyle: 'italic' }}>Complies with QC E-Governance Security Mandate</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}>SEC-V4.4</span>
        </Box>
      </Box>
    </Box>
  )
}
