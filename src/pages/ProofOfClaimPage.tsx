import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import keychronImg from '@/assets/ui/keychron.jpeg'

export const ProofOfClaimPage: FC = () => {
  const navigate = useNavigate()

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
            Proof of claim
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c' }}>
            Step 2 of 2 • Photo verification
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
          <HelpOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Upload Proof Photo Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#ebf2eb',
              color: '#384735',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CameraAltOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#292524' }}>
              Upload proof photo
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.25, lineHeight: 1.45 }}>
              Take or upload any photo showing the e-waste item (handoff, receipt, or device at pickup site).
            </Typography>
          </Box>
        </Box>

        {/* Drag & drop upload target */}
        <Box
          sx={{
            borderRadius: 3.5,
            border: '2px dashed #d6cfc5',
            backgroundColor: '#faf8f5',
            p: 2.5,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#4f5f4b' }} />
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524' }}>
            Drag &amp; drop or click to upload
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
            Supports JPG, PNG up to 10MB
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<CameraAltOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              backgroundColor: '#4f5f4b',
              color: '#ffffff',
              fontSize: '0.8125rem',
              py: 1.1,
            }}
          >
            Take photo
          </Button>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<PhotoLibraryOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: '#ede8e1',
              color: '#292524',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              py: 1.1,
            }}
          >
            Upload gallery
          </Button>
        </Box>
      </Card>

      {/* ── Item Details Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
              Item details
            </Typography>
          </Box>
          <StatusBadge label="Code verified: Yes" variant="available" size="sm" />
        </Box>

        <Box
          sx={{
            backgroundColor: '#faf8f5',
            borderRadius: 3,
            p: 1.5,
            border: '1px solid #ede8e1',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mb: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '1px solid #ede8e1',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={keychronImg}
                alt="Keychron K2 V2"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
                Item
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
                Keychron K2 V2
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 1, pt: 1, borderTop: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StorefrontRoundedIcon sx={{ fontSize: 18, color: '#78716c' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#78716c' }}>
                  Station
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#292524' }}>
                  Pasig Green Hub
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#78716c' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#78716c' }}>
                  Date
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#292524' }}>
                  Today / Oct 25
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ── Circularity Impact Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, backgroundColor: '#ebf2eb', border: '1px solid #ceebc4' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#384735',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ForestRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#2d3e2c' }}>
              Circularity impact
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#384735', mt: 0.25, lineHeight: 1.45 }}>
              Claiming refurbished electronics diverts <strong>~14.8 kg</strong> of e-waste from regional landfills.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Submit Proof Button ── */}
      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/requests')}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          Submit proof
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
          Status becomes Claimed automatically.
        </Typography>
      </Box>
    </Box>
  )
}

