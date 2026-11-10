import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  OutlinedInput,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const AddDetailsPage: FC = () => {
  const navigate = useNavigate()

  // Guided questions state
  const [workingStatus, setWorkingStatus] = useState<'yes' | 'no' | 'notsure'>('no')
  const [visibleDamage, setVisibleDamage] = useState<string[]>(['cracked', 'swollen'])
  const [missingParts, setMissingParts] = useState<string[]>(['none'])
  const [notes, setNotes] = useState('')

  const toggleDamage = (val: string) => {
    if (val === 'none') {
      setVisibleDamage(['none'])
    } else {
      const filtered = visibleDamage.filter((d) => d !== 'none')
      if (filtered.includes(val)) {
        setVisibleDamage(filtered.filter((d) => d !== val))
      } else {
        setVisibleDamage([...filtered, val])
      }
    }
  }

  const toggleMissing = (val: string) => {
    if (val === 'none') {
      setMissingParts(['none'])
    } else {
      const filtered = missingParts.filter((m) => m !== 'none')
      if (filtered.includes(val)) {
        setMissingParts(filtered.filter((m) => m !== val))
      } else {
        setMissingParts([...filtered, val])
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          aria-label="Back"
          sx={{
            width: 38,
            height: 38,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
            Add Details
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
            E-Waste Assessment
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label="Tune assessment options"
          sx={{
            width: 38,
            height: 38,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Card 1: Photos captured ── */}
      <Card
        sx={{
          p: 2.25,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
            Photos captured
          </Typography>
          <StatusBadge label="6/6 angles ready" variant="electric" size="sm" />
        </Box>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mb: 1.75, lineHeight: 1.45 }}>
          Multi-angle optical telemetry for automated hardware classification.
        </Typography>

        {/* 4 Thumbnails */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {[
            { label: 'Front', ready: true, icon: '📱' },
            { label: 'Back', ready: true, icon: '📱' },
            { label: 'Left', ready: true, icon: '🔍' },
            { label: 'Right', ready: false, icon: '🔍' },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                height: 76,
                borderRadius: 1.25,
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                color: '#ffffff',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                p: 0.5,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {item.ready && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#abf06b',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckRoundedIcon sx={{ fontSize: 11 }} />
                </Box>
              )}
              <Typography sx={{ fontSize: '1.25rem', my: 'auto', opacity: 0.75 }}>{item.icon}</Typography>
              <Box
                sx={{
                  width: '100%',
                  backgroundColor: 'rgba(2, 6, 23, 0.75)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: 1,
                  py: 0.25,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#ffffff' }}>
                  {item.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* ── Card 2: Guided Questions ── */}
      <Card
        sx={{
          p: 2.25,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
            Guided questions
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#64748b', letterSpacing: '0.06em' }}>
            TELEMETRY INPUTS
          </Typography>
        </Box>

        {/* Q1: Is it working? */}
        <Box sx={{ mb: 2.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
              1. Is it working? *
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
              Powers on / boots
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {[
              { id: 'yes', label: 'Yes', icon: <CheckRoundedIcon sx={{ fontSize: 16 }} /> },
              { id: 'no', label: 'No', icon: <CloseRoundedIcon sx={{ fontSize: 16 }} /> },
              { id: 'notsure', label: 'Not sure', icon: <HelpOutlineRoundedIcon sx={{ fontSize: 16 }} /> },
            ].map((opt) => {
              const isSel = workingStatus === opt.id
              return (
                <Button
                  key={opt.id}
                  variant={isSel ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setWorkingStatus(opt.id as 'yes' | 'no' | 'notsure')}
                  startIcon={opt.icon}
                  sx={{
                    py: 0.9,
                    borderRadius: 1.25,
                    fontSize: '0.8125rem',
                    backgroundColor: isSel ? '#0f172a' : '#ffffff',
                    color: isSel ? '#ffffff' : '#0f172a',
                    borderColor: isSel ? '#0f172a' : '#e2e8f0',
                    boxShadow: isSel ? '0 1px 3px rgba(15,23,42,0.2)' : 'none',
                    '&:hover': {
                      backgroundColor: isSel ? '#1e293b' : '#f8fafc',
                      borderColor: isSel ? '#1e293b' : '#cbd5e1',
                    },
                  }}
                >
                  {opt.label}
                </Button>
              )
            })}
          </Box>
        </Box>

        {/* Q2: Visible damage */}
        <Box sx={{ mb: 2.25 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mb: 1.25 }}>
            2. Visible damage (Select all that apply)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Cracked */}
            <Box
              onClick={() => toggleDamage('cracked')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: visibleDamage.includes('cracked') ? '#0f172a' : '#ffffff',
                color: visibleDamage.includes('cracked') ? '#ffffff' : '#0f172a',
                border: visibleDamage.includes('cracked') ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <SmartphoneRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                Cracked
              </Typography>
              {visibleDamage.includes('cracked') && <CloseRoundedIcon sx={{ fontSize: 14 }} />}
            </Box>

            {/* Burn marks */}
            <Box
              onClick={() => toggleDamage('burn')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: visibleDamage.includes('burn') ? '#0f172a' : '#ffffff',
                color: visibleDamage.includes('burn') ? '#ffffff' : '#0f172a',
                border: visibleDamage.includes('burn') ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <WhatshotRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                Burn marks
              </Typography>
              {visibleDamage.includes('burn') && <CloseRoundedIcon sx={{ fontSize: 14 }} />}
            </Box>

            {/* Swollen battery HAZARD */}
            <Box
              onClick={() => toggleDamage('swollen')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1.5px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(245, 158, 11, 0.15)',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#b45309' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                Swollen battery
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  px: 0.75,
                  py: 0.15,
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.5625rem', color: '#b45309' }}>
                  HAZARD
                </Typography>
              </Box>
            </Box>

            {/* None */}
            <Box
              onClick={() => toggleDamage('none')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: visibleDamage.includes('none') ? '#0f172a' : '#ffffff',
                color: visibleDamage.includes('none') ? '#ffffff' : '#0f172a',
                border: visibleDamage.includes('none') ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                None
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Q3: Missing parts */}
        <Box sx={{ mb: 2.25 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mb: 1.25 }}>
            3. Missing parts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['Battery', 'Cover', 'Screen'].map((part) => {
              const isSel = missingParts.includes(part.toLowerCase())
              return (
                <Box
                  key={part}
                  onClick={() => toggleMissing(part.toLowerCase())}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 9999,
                    backgroundColor: isSel ? '#0f172a' : '#ffffff',
                    color: isSel ? '#ffffff' : '#0f172a',
                    border: isSel ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <BatteryAlertRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                    {part}
                  </Typography>
                </Box>
              )
            })}

            {/* None */}
            <Box
              onClick={() => toggleMissing('none')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: missingParts.includes('none') ? '#0f172a' : '#ffffff',
                color: missingParts.includes('none') ? '#ffffff' : '#0f172a',
                border: missingParts.includes('none') ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                cursor: 'pointer',
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                None
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Notes */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
              Notes (optional)
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
              Diagnostics aid
            </Typography>
          </Box>
          <OutlinedInput
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Turns on but screen flickers, battery discharges quickly"
            sx={{
              borderRadius: 1.5,
              backgroundColor: '#f8fafc',
              fontSize: '0.8125rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#cbd5e1',
              },
            }}
          />
        </Box>
      </Card>

      {/* ── Card 3: EcoByte Vision Engine ── */}
      <Card
        sx={{
          p: 2.25,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              backgroundColor: '#0f172a',
              color: '#abf06b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SecurityRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                EcoByte Vision Engine
              </Typography>
              <StatusBadge label="ACTIVE" variant="electric" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.35, lineHeight: 1.4 }}>
              Compares camera angle telemetry against 42,000+ certified hardware schematics to calculate circular reuse viability.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Analyze CTA Button ── */}
      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/diagnostic')}
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
            '&:hover': {
              backgroundColor: '#1e293b',
            },
          }}
        >
          Analyze e-waste
        </Button>
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#64748b',
            textAlign: 'center',
            mt: 1,
          }}
        >
          Initial classification will take approximately 3-5 seconds.
        </Typography>
      </Box>
    </Box>
  )
}
