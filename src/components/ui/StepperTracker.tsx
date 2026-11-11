import type { FC } from 'react'
import { Box, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'

export interface StepItem {
  id: number
  label: string
}

interface StepperTrackerProps {
  steps: StepItem[]
  currentStep: number
}

export const StepperTracker: FC<StepperTrackerProps> = ({ steps, currentStep }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
    {steps.map((step, i) => {
      const done = step.id < currentStep
      const active = step.id === currentStep
      const last = i === steps.length - 1

      return (
        <Box key={step.id} sx={{ display: 'flex', alignItems: 'flex-start', flex: last ? 0 : 1 }}>
          {/* Circle + label */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? '#4f5f4b' : active ? '#ffffff' : '#ffffff',
                border: done ? 'none' : active ? '2.5px solid #4f5f4b' : '1.5px solid #d6cfc5',
                boxShadow: active ? '0 0 0 3px rgba(79,95,75,0.12)' : 'none',
              }}
            >
              {done ? (
                <CheckRoundedIcon sx={{ fontSize: 14, color: '#ffffff' }} />
              ) : active ? (
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4f5f4b' }} />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    color: '#a8a29e',
                  }}
                >
                  {step.id}
                </Typography>
              )}
            </Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: done || active ? 700 : 600,
                fontSize: '0.625rem',
                color: done || active ? '#292524' : '#a8a29e',
                mt: 0.6,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {step.label}
            </Typography>
          </Box>

          {/* Connector line */}
          {!last && (
            <Box
              sx={{
                flex: 1,
                height: 2,
                mt: '12px',
                backgroundColor: done ? '#4f5f4b' : '#ede8e1',
                mx: 0.25,
              }}
            />
          )}
        </Box>
      )
    })}
  </Box>
)
