import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  LinearProgress,
  Typography,
} from '@mui/material'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

import keychronImg from '@/assets/ui/keychron.jpeg'

export const MyRequestsPage: FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5, pb: 4 }}>
      {/* Top Bar Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            onClick={() => navigate('/')}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              backgroundColor: '#ffffff',
              border: '1px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4f5f4b',
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16, ml: 0.5 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#4f5f4b',
                lineHeight: 1.2,
              }}
            >
              My Requests
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.6875rem',
                color: '#78716c',
                fontWeight: 600,
              }}
            >
              Track pickups &amp; active reservations
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4f5f4b',
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>

      {/* Segmented Pill Tabs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          p: 0.5,
          backgroundColor: '#ebe6df',
          borderRadius: 9999,
        }}
      >
        <Box
          onClick={() => setActiveTab('ongoing')}
          sx={{
            py: 0.75,
            textAlign: 'center',
            borderRadius: 9999,
            backgroundColor: activeTab === 'ongoing' ? '#4f5f4b' : 'transparent',
            color: activeTab === 'ongoing' ? '#ffffff' : '#78716c',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Ongoing (2)
        </Box>
        <Box
          onClick={() => setActiveTab('completed')}
          sx={{
            py: 0.75,
            textAlign: 'center',
            borderRadius: 9999,
            backgroundColor: activeTab === 'completed' ? '#4f5f4b' : 'transparent',
            color: activeTab === 'completed' ? '#ffffff' : '#78716c',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Completed
        </Box>
      </Box>

      {activeTab === 'ongoing' ? (
        <>
          {/* Active Reservations Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#292524',
                }}
              >
                Reservations
              </Typography>
              <StatusBadge label="1 Active" variant="available" size="sm" />
            </Box>

            <Card
              sx={{
                p: 2,
                borderRadius: 4,
                backgroundColor: '#ffffff',
                border: '1px solid #ede8e1',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                {/* Keyboard Thumbnail */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: '#f4ede4',
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

                {/* Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#292524',
                      }}
                    >
                      Keychron K2 V2
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: '#e8f0e6',
                        px: 1,
                        py: 0.3,
                        borderRadius: 9999,
                        border: '1px solid #c8d8c5',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          color: '#4f5f4b',
                        }}
                      >
                        Code: ECO-4821
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#78716c',
                      fontWeight: 500,
                      mt: 0.5,
                      lineHeight: 1.4,
                    }}
                  >
                    Held for 2 days · Pick up by Fri, Oct 23
                    <br />
                    (San Antonio Hub)
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2, pt: 1.5, borderTop: '1px solid #ede8e1' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<QrCode2RoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => navigate('/reservation-code')}
                  sx={{
                    borderColor: '#4f5f4b',
                    color: '#4f5f4b',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 9999,
                    py: 0.8,
                    '&:hover': {
                      backgroundColor: 'rgba(79,95,75,0.06)',
                      borderColor: '#4f5f4b',
                    },
                  }}
                >
                  View Code (ECO-4821)
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => navigate('/proof-of-claim')}
                  sx={{
                    backgroundColor: '#4f5f4b',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 9999,
                    py: 0.8,
                    '&:hover': { backgroundColor: '#384735' },
                  }}
                >
                  Upload Proof of Claim
                </Button>
              </Box>
            </Card>
          </Box>

          {/* Ongoing Requests List Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                color: '#292524',
              }}
            >
              Ongoing Drop-offs
            </Typography>

            {/* Request 1 */}
            <Card
              sx={{
                p: 2,
                borderRadius: 4,
                border: '1px solid #ede8e1',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/dropoff-schedule')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: '#292524',
                    }}
                  >
                    Request #2041
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#78716c',
                      fontWeight: 500,
                      mt: 0.25,
                    }}
                  >
                    MacBook Pro 13″ · San Antonio Hub
                  </Typography>
                </Box>
                <StatusBadge label="Scheduled" variant="active" size="sm" />
              </Box>

              <Box sx={{ my: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#4f5f4b',
                      fontWeight: 700,
                    }}
                  >
                    Drop-off confirmed
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#4f5f4b',
                      fontWeight: 700,
                    }}
                  >
                    Step 2/3
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={66}
                  sx={{
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: '#e8f0e6',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#4f5f4b' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#78716c' }} />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.6875rem',
                    color: '#78716c',
                    fontWeight: 500,
                  }}
                >
                  Scheduled slot: Today, 3:30 PM • Pasig Green Hub
                </Typography>
              </Box>
            </Card>

            {/* Request 2 */}
            <Card
              sx={{
                p: 2,
                borderRadius: 4,
                border: '1px solid #ede8e1',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/assess')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: '#292524',
                    }}
                  >
                    Request #2042
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#78716c',
                      fontWeight: 500,
                      mt: 0.25,
                    }}
                  >
                    Galaxy A52 · Bel-Air Drop Site
                  </Typography>
                </Box>
                <StatusBadge label="Under review" variant="pending" size="sm" />
              </Box>

              <Box sx={{ my: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#d97706',
                      fontWeight: 700,
                    }}
                  >
                    Submitted
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#78716c',
                      fontWeight: 700,
                    }}
                  >
                    Step 1/3
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={33}
                  sx={{
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: '#fef3c7',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#d97706' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#78716c' }} />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.6875rem',
                    color: '#78716c',
                    fontWeight: 500,
                  }}
                >
                  Assessment submitted · AI diagnostic completed
                </Typography>
              </Box>
            </Card>
          </Box>
        </>
      ) : (
        /* Completed State */
        <Box sx={{ textAlign: 'center', py: 6, color: '#78716c' }}>
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 48, color: '#4f5f4b', mb: 1.5 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              color: '#292524',
            }}
          >
            No completed requests yet
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.8125rem',
              color: '#78716c',
              mt: 0.5,
              maxWidth: 260,
              mx: 'auto',
            }}
          >
            Items you safely drop off and recycle or reuse will appear here.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
