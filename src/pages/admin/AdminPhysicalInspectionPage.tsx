import { useState, type FC } from 'react'
import { Alert, Box, ButtonBase, Snackbar, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { InspectionWorkbench } from '@/components/admin/InspectionWorkbench'

export const AdminPhysicalInspectionPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const itemParam = searchParams.get('item') || 'item-201'
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* ── Top Header / Breadcrumbs ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <ButtonBase
              onClick={() => navigate('/admin/to-inspect')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: 700,
                '&:hover': { color: '#0f172a' },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              <span>Back to Queue</span>
            </ButtonBase>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Physical Workstation
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.125rem' },
              color: '#0b1c30',
              letterSpacing: '-0.025em',
            }}
          >
            Resident Request &amp; Physical Inspection Form
          </Typography>
        </Box>
      </Box>

      <InspectionWorkbench
        itemId={itemParam}
        onSubmitted={(action, routedTo) => {
          setSuccessMsg(`Decision saved (${routedTo}) and resident notified.`)
          const target =
            action === 'REUSE'
              ? '/admin/transactions?tab=reuse'
              : action === 'DISPOSAL' || action === 'HAZARDOUS'
                ? '/admin/to-inspect?tab=disposal'
                : '/admin/to-inspect'
          setTimeout(() => {
            navigate(target)
          }, 1100)
        }}
      />

      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminPhysicalInspectionPage
