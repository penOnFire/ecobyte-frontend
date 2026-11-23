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
                backgroundColor: done ? '#000000' : active ? '#D5F5C3' : '#FFFFFF',
                border: done ? 'none' : active ? '2px solid #BEEB64' : '1.5px solid rgba(220, 207, 192, 0.7)',
                transition: 'background-color 180ms ease, border-color 180ms ease',
              }}
            >
              {done ? (
                <CheckRoundedIcon sx={{ fontSize: 14, color: '#ffffff' }} />
              ) : active ? (
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#8FC25F' }} />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    color: '#7F897D',
                  }}
                >
                  {step.id}
                </Typography>
              )}
            </Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: done || active ? 700 : 500,
                fontSize: '0.625rem',
                color: done || active ? '#1F2937' : '#596556',
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
                mt: '13px',
                backgroundColor: done ? '#4F5F4B' : 'rgba(220, 207, 192, 0.5)',
                mx: 0.25,
                borderRadius: 1,
              }}
            />
          )}
        </Box>
      )
    })}
  </Box>
)
