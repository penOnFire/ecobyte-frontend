import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
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
          <IconButton
            size="small"
            onClick={() => navigate('/')}
            aria-label="Back"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
              }}
            >
              My Requests
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.6875rem',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              Track pickups &amp; active reservations
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          aria-label="Filter"
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Segmented Pill Tabs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          p: 0.5,
          backgroundColor: '#f1f5f9',
          borderRadius: 9999,
          border: '1px solid #e2e8f0',
        }}
      >
        <Box
          onClick={() => setActiveTab('ongoing')}
          sx={{
            py: 0.85,
            textAlign: 'center',
            borderRadius: 9999,
            backgroundColor: activeTab === 'ongoing' ? '#0f172a' : 'transparent',
            color: activeTab === 'ongoing' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'ongoing' ? '0 1px 3px rgba(15,23,42,0.15)' : 'none',
          }}
        >
          Ongoing (2)
        </Box>
        <Box
          onClick={() => setActiveTab('completed')}
          sx={{
            py: 0.85,
            textAlign: 'center',
            borderRadius: 9999,
            backgroundColor: activeTab === 'completed' ? '#0f172a' : 'transparent',
            color: activeTab === 'completed' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'completed' ? '0 1px 3px rgba(15,23,42,0.15)' : 'none',
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
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              >
                Reservations
              </Typography>
              <StatusBadge label="1 Active" variant="electric" size="sm" />
            </Box>

            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                {/* Keyboard Thumbnail */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1.25,
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
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
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: '#0f172a',
                      }}
                    >
                      Keychron K2 V2
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: '#0f172a',
                        px: 1,
                        py: 0.3,
                        borderRadius: 9999,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          color: '#abf06b',
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
                      color: '#64748b',
                      fontWeight: 500,
                      mt: 0.5,
                      lineHeight: 1.45,
                    }}
                  >
                    Held for 2 days · Pick up by Fri, Oct 23
                    <br />
                    (San Antonio Hub)
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<QrCode2RoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => navigate('/reservation-code')}
                  sx={{
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 9999,
                    py: 0.8,
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      borderColor: '#cbd5e1',
                    },
                  }}
                >
                  View Code
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 18, color: '#abf06b' }} />}
                  onClick={() => navigate('/proof-of-claim')}
                  sx={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 9999,
                    py: 0.8,
                    boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
                    '&:hover': { backgroundColor: '#1e293b' },
                  }}
                >
                  Upload Proof
                </Button>
              </Box>
            </Card>
          </Box>

          {/* Ongoing Requests List Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                color: '#0f172a',
              }}
            >
              Ongoing Drop-offs
            </Typography>

            {/* Request 1 */}
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#0f172a' },
              }}
              onClick={() => navigate('/schedule-dropoff')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      color: '#0f172a',
                    }}
                  >
                    Request #2041
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 500,
                      mt: 0.25,
                    }}
                  >
                    MacBook Pro 13″ · San Antonio Hub
                  </Typography>
                </Box>
                <StatusBadge label="Scheduled" variant="electric" size="sm" />
              </Box>

              <Box sx={{ my: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#0f172a',
                      fontWeight: 700,
                    }}
                  >
                    Drop-off confirmed
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#0f172a',
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
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#0f172a' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.6875rem',
                    color: '#64748b',
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
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#0f172a' },
              }}
              onClick={() => navigate('/assess')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      color: '#0f172a',
                    }}
                  >
                    Request #2042
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 500,
                      mt: 0.25,
                    }}
                  >
                    Galaxy A52 · Bel-Air Drop Site
                  </Typography>
                </Box>
                <StatusBadge label="Under review" variant="hazard" size="sm" />
              </Box>

              <Box sx={{ my: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#b45309',
                      fontWeight: 700,
                    }}
                  >
                    Submitted
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#64748b',
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
                    '& .MuiLinearProgress-bar': { backgroundColor: '#f59e0b' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.6875rem',
                    color: '#64748b',
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
        <Box sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 48, color: '#0f172a', mb: 1.5 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: '1rem',
              color: '#0f172a',
            }}
          >
            No completed requests yet
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.8125rem',
              color: '#64748b',
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
