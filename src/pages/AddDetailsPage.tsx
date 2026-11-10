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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            borderRadius: '50%',
            color: '#292524',
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#292524' }}>
            Add Details
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c' }}>
            E-Waste Assessment
          </Typography>
        </Box>

        <IconButton
          size="small"
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            borderRadius: '50%',
            color: '#292524',
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Card 1: Photos captured ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
            Photos captured
          </Typography>
          <StatusBadge label="6/6 angles ready" variant="available" size="sm" />
        </Box>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mb: 1.5 }}>
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
                height: 72,
                borderRadius: 2.5,
                backgroundColor: '#292524',
                color: '#ffffff',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                p: 0.5,
                overflow: 'hidden',
              }}
            >
              {item.ready && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#4f5f4b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckRoundedIcon sx={{ fontSize: 10, color: '#ffffff' }} />
                </Box>
              )}
              <Typography sx={{ fontSize: '1.25rem', my: 'auto', opacity: 0.6 }}>{item.icon}</Typography>
              <Box
                sx={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 1.5,
                  py: 0.15,
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
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
            Guided questions
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#78716c', letterSpacing: '0.06em' }}>
            TELEMETRY INPUTS
          </Typography>
        </Box>

        {/* Q1: Is it working? */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524' }}>
              1. Is it working? *
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
              Powers on / boots
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Button
              variant={workingStatus === 'yes' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setWorkingStatus('yes')}
              startIcon={<CheckRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 0.8,
                borderRadius: 3,
                fontSize: '0.8125rem',
                backgroundColor: workingStatus === 'yes' ? '#4f5f4b' : '#ffffff',
                color: workingStatus === 'yes' ? '#ffffff' : '#292524',
                borderColor: '#ede8e1',
              }}
            >
              Yes
            </Button>
            <Button
              variant={workingStatus === 'no' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setWorkingStatus('no')}
              startIcon={<CloseRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 0.8,
                borderRadius: 3,
                fontSize: '0.8125rem',
                backgroundColor: workingStatus === 'no' ? '#4f5f4b' : '#ffffff',
                color: workingStatus === 'no' ? '#ffffff' : '#292524',
                borderColor: '#ede8e1',
              }}
            >
              No
            </Button>
            <Button
              variant={workingStatus === 'notsure' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setWorkingStatus('notsure')}
              startIcon={<HelpOutlineRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 0.8,
                borderRadius: 3,
                fontSize: '0.8125rem',
                backgroundColor: workingStatus === 'notsure' ? '#4f5f4b' : '#ffffff',
                color: workingStatus === 'notsure' ? '#ffffff' : '#292524',
                borderColor: '#ede8e1',
              }}
            >
              Not sure
            </Button>
          </Box>
        </Box>

        {/* Q2: Visible damage */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524', mb: 1 }}>
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
                backgroundColor: visibleDamage.includes('cracked') ? '#4f5f4b' : '#ffffff',
                color: visibleDamage.includes('cracked') ? '#ffffff' : '#292524',
                border: visibleDamage.includes('cracked') ? '1.5px solid #4f5f4b' : '1.5px solid #ede8e1',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
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
                backgroundColor: visibleDamage.includes('burn') ? '#4f5f4b' : '#ffffff',
                color: visibleDamage.includes('burn') ? '#ffffff' : '#292524',
                border: visibleDamage.includes('burn') ? '1.5px solid #4f5f4b' : '1.5px solid #ede8e1',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
              }}
            >
              <WhatshotRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                Burn marks
              </Typography>
            </Box>

            {/* Swollen battery HAZARD */}
            <Box
              onClick={() => toggleDamage('swollen')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: '#fffbeb',
                color: '#78350f',
                border: '1.5px solid #d97706',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#d97706' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                Swollen battery
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#fde68a',
                  px: 0.75,
                  py: 0.1,
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#78350f' }}>
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
                backgroundColor: visibleDamage.includes('none') ? '#4f5f4b' : '#ffffff',
                color: visibleDamage.includes('none') ? '#ffffff' : '#292524',
                border: visibleDamage.includes('none') ? '1.5px solid #4f5f4b' : '1.5px solid #ede8e1',
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
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524', mb: 1 }}>
            3. Missing parts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['Battery', 'Cover', 'Screen'].map((part) => (
              <Box
                key={part}
                onClick={() => toggleMissing(part.toLowerCase())}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  borderRadius: 9999,
                  backgroundColor: missingParts.includes(part.toLowerCase()) ? '#4f5f4b' : '#ffffff',
                  color: missingParts.includes(part.toLowerCase()) ? '#ffffff' : '#292524',
                  border: missingParts.includes(part.toLowerCase()) ? '1.5px solid #4f5f4b' : '1.5px solid #ede8e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  cursor: 'pointer',
                }}
              >
                <BatteryAlertRoundedIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                  {part}
                </Typography>
              </Box>
            ))}

            {/* None */}
            <Box
              onClick={() => toggleMissing('none')}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                backgroundColor: missingParts.includes('none') ? '#4f5f4b' : '#ffffff',
                color: missingParts.includes('none') ? '#ffffff' : '#292524',
                border: missingParts.includes('none') ? '1.5px solid #4f5f4b' : '1.5px solid #ede8e1',
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
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524' }}>
              Notes (optional)
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
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
              borderRadius: 3.5,
              backgroundColor: '#faf8f5',
              fontSize: '0.8125rem',
            }}
          />
        </Box>
      </Card>

      {/* ── Card 3: EcoByte Vision Engine ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              backgroundColor: '#e8f0e6',
              color: '#384735',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SecurityRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
                EcoByte Vision Engine
              </Typography>
              <StatusBadge label="ACTIVE" variant="available" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.25 }}>
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
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          Analyze e-waste
        </Button>
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#78716c',
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

