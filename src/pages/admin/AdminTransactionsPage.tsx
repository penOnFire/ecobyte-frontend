import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { adminApi, type AdminTransactionItem } from '@/lib/api'
import { AdminReuseHubPage } from '@/pages/admin/AdminReuseHubPage'

export const AdminTransactionsPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const mainTab = searchParams.get('tab') === 'reuse' ? 'reuse' : 'ledger'
  const setMainTab = (tab: 'ledger' | 'reuse') => {
    if (tab === 'reuse') {
      setSearchParams({ tab: 'reuse' })
    } else {
      setSearchParams({})
    }
  }

  const [filterType, setFilterType] = useState<'all' | 'dropoff' | 'reuse'>('all')
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTx, setSelectedTx] = useState<AdminTransactionItem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Pick-up verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [inputPickupCode, setInputPickupCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .getTransactions({
        type: filterType,
        search,
      })
      .then((data) => {
        if (active) {
          setTransactions(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.warn('Could not load transactions from backend:', err)
          setIsLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [filterType, search, refreshTrigger])

  const handleOpenVerifyModal = (tx: AdminTransactionItem) => {
    setSelectedTx(tx)
    setInputPickupCode('')
    setVerificationError(null)
    setVerifyModalOpen(true)
  }

  const handleVerifyPickup = async () => {
    if (!selectedTx) return
    const code = inputPickupCode.trim()
    if (!code) {
      setVerificationError('Please enter the resident’s pick-up code.')
      return
    }

    setIsVerifying(true)
    setVerificationError(null)

    try {
      const res = await adminApi.verifyPickupCode({
        listingId: selectedTx.type === 'Reuse Pick-Up' ? selectedTx.rawId : undefined,
        claimId: selectedTx.type === 'Reuse Pick-Up' ? selectedTx.rawId : undefined,
        pickupCode: code,
      })

      if (!res.matched || !res.success) {
        setVerificationError(res.error || 'Reject: not the reserving resident')
        setIsVerifying(false)
        return
      }

      setToast({
        message: 'Pick-up code matched! Status updated to Picked Up.',
        severity: 'success',
      })
      setVerifyModalOpen(false)
      setIsLoading(true)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err: any) {
      const errMsg = err?.message || 'Reject: not the reserving resident'
      setVerificationError(errMsg.includes('not match') ? 'Reject: not the reserving resident' : errMsg)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* ── Top Header Strip ── */}
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
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '9999px',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Operations &amp; Claims Ledger
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
            Transactions
          </Typography>
        </Box>

        {/* Telemetry pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2,
            py: 0.85,
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <ReceiptLongRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
            Total Recorded:
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
            {transactions.length}
          </Typography>
        </Box>
      </Box>

      {/* ── Transactions Module Tabs (Reuse Hub is inside Transactions!) ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          borderBottom: '1px solid #e2e8f0',
          pb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <ButtonBase
          onClick={() => {
            setMainTab('ledger')
            setSearchParams({})
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2.25,
            py: 1,
            borderRadius: '9999px',
            backgroundColor: mainTab === 'ledger' ? '#16a34a' : '#ffffff',
            color: mainTab === 'ledger' ? '#ffffff' : '#475569',
            border: `1px solid ${mainTab === 'ledger' ? '#16a34a' : '#cbd5e1'}`,
            fontSize: '0.8125rem',
            fontWeight: 800,
            boxShadow: mainTab === 'ledger' ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: mainTab === 'ledger' ? '#15803d' : '#f8fafc',
            },
          }}
        >
          <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
          <span>Transactions Ledger &amp; Verification</span>
        </ButtonBase>

        <ButtonBase
          onClick={() => {
            setMainTab('reuse')
            setSearchParams({ tab: 'reuse' })
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2.25,
            py: 1,
            borderRadius: '9999px',
            backgroundColor: mainTab === 'reuse' ? '#16a34a' : '#ffffff',
            color: mainTab === 'reuse' ? '#ffffff' : '#475569',
            border: `1px solid ${mainTab === 'reuse' ? '#16a34a' : '#cbd5e1'}`,
            fontSize: '0.8125rem',
            fontWeight: 800,
            boxShadow: mainTab === 'reuse' ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: mainTab === 'reuse' ? '#15803d' : '#f8fafc',
            },
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
          <span>Reuse Hub Inventory &amp; Listings</span>
        </ButtonBase>
      </Box>

      {mainTab === 'reuse' ? (
        <AdminReuseHubPage />
      ) : (
        <>
          {/* ── Filters & Search Strip ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {/* Search */}
        <Box sx={{ position: 'relative', width: { xs: '100%', md: 360 } }}>
          <SearchRoundedIcon
            sx={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: 20,
            }}
          />
          <input
            type="text"
            placeholder="Search by code, resident, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              paddingLeft: 42,
              paddingRight: 16,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </Box>

        {/* Filter Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FilterListRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'dropoff', label: 'Drop-Offs' },
            { id: 'reuse', label: 'Reuse Claims' },
          ].map((tab) => {
            const active = filterType === tab.id
            return (
              <ButtonBase
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                sx={{
                  px: 1.75,
                  py: 0.85,
                  borderRadius: '9999px',
                  backgroundColor: active ? '#16a34a' : '#f1f5f9',
                  color: active ? '#ffffff' : '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: active ? '#15803d' : '#e2e8f0',
                  },
                }}
              >
                {tab.label}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* ── Transactions Table ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} color="success" />
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
            <ReceiptLongRoundedIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>No transactions found</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Drop-offs and Reuse Hub reservations will appear here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Transaction
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Type
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Item
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Resident
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Site &amp; Date/Slot
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isDropoff = tx.type === 'Drop-Off'
                  const isReserved = tx.status === 'reserved'
                  const isClaimed = tx.status === 'claimed'

                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0b1c30' }}>
                          {tx.transactionNumber}
                        </Typography>
                        {tx.pickupCode && (
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: '#16a34a', fontWeight: 700 }}>
                            Code: {tx.pickupCode}
                          </Typography>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.35, borderRadius: 6, backgroundColor: isDropoff ? '#eff4ff' : '#f0fdf4', color: isDropoff ? '#1d4ed8' : '#15803d', fontSize: '0.6875rem', fontWeight: 700 }}>
                          {isDropoff ? <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} /> : <Inventory2OutlinedIcon sx={{ fontSize: 13 }} />}
                          <span>{tx.type}</span>
                        </Box>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                          {tx.itemName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {tx.category}
                        </Typography>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                          {tx.residentName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {tx.residentEmail || tx.residentPhone}
                        </Typography>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                          {tx.siteName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {tx.dateSlot}
                        </Typography>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.35,
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor:
                              isClaimed || tx.status === 'turned_over' || tx.status === 'completed'
                                ? '#dcfce7'
                                : isReserved || tx.status === 'scheduled'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                            color:
                              isClaimed || tx.status === 'turned_over' || tx.status === 'completed'
                                ? '#15803d'
                                : isReserved || tx.status === 'scheduled'
                                  ? '#b45309'
                                  : '#475569',
                          }}
                        >
                          {tx.displayStatus}
                        </Box>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {isReserved ? (
                          <ButtonBase
                            onClick={() => handleOpenVerifyModal(tx)}
                            sx={{
                              height: 32,
                              px: 1.5,
                              borderRadius: '8px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              '&:hover': { backgroundColor: '#15803d' },
                            }}
                          >
                            <QrCode2RoundedIcon sx={{ fontSize: 16 }} />
                            <span>Verify Pick-Up</span>
                          </ButtonBase>
                        ) : (
                          <ButtonBase
                            onClick={() => setSelectedTx(tx)}
                            sx={{
                              height: 32,
                              px: 1.5,
                              borderRadius: '8px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              '&:hover': { backgroundColor: '#e2e8f0' },
                            }}
                          >
                            Details
                          </ButtonBase>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {/* ── Transaction Details & Verification Modal ── */}
      <Dialog
        open={Boolean(selectedTx && !verifyModalOpen)}
        onClose={() => setSelectedTx(null)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0b1c30' }}>
              Transaction Details
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {selectedTx?.transactionNumber} • {selectedTx?.type}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedTx(null)} size="small">
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Item
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                {selectedTx?.itemName}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Category: {selectedTx?.category}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Resident
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                {selectedTx?.residentName}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                {selectedTx?.residentEmail}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Drop-Off / Claim Station
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                {selectedTx?.siteName}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Slot: {selectedTx?.dateSlot}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Current Status
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#16a34a' }}>
                {selectedTx?.displayStatus}
              </Typography>
              {selectedTx?.pickupCode && (
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>
                  Hold Code: {selectedTx.pickupCode}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <ButtonBase
            onClick={() => setSelectedTx(null)}
            sx={{ px: 2, py: 0.85, borderRadius: '8px', color: '#64748b', fontSize: '0.8125rem', fontWeight: 700 }}
          >
            Close
          </ButtonBase>
          {selectedTx?.status === 'reserved' && (
            <ButtonBase
              onClick={() => {
                const tx = selectedTx
                setSelectedTx(null)
                handleOpenVerifyModal(tx)
              }}
              sx={{
                px: 2,
                py: 0.85,
                borderRadius: '8px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                '&:hover': { backgroundColor: '#15803d' },
              }}
            >
              Verify Station Pick-Up
            </ButtonBase>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Reuse Hub Pick-Up Verification Modal (Module 6C) ── */}
      <Dialog
        open={verifyModalOpen}
        onClose={() => !isVerifying && setVerifyModalOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode2RoundedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0b1c30' }}>
              Verify Pick-Up Code
            </Typography>
          </Box>
          <IconButton onClick={() => setVerifyModalOpen(false)} size="small" disabled={isVerifying}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: '#475569' }}>
            Ask the resident for their 6-character pick-up code (e.g., <strong>ECO-4821</strong>) displayed on their claim pass.
          </Typography>

          <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Item Claiming:</Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedTx?.itemName}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Reserving Resident: <strong>{selectedTx?.residentName}</strong>
            </Typography>
          </Box>

          <TextField
            autoFocus
            fullWidth
            label="Pick-Up Code"
            placeholder="e.g. ECO-4821"
            value={inputPickupCode}
            onChange={(e) => {
              setInputPickupCode(e.target.value.toUpperCase())
              setVerificationError(null)
            }}
            slotProps={{
              htmlInput: {
                style: {
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                },
              },
            }}
          />

          {verificationError && (
            <Alert severity="error" icon={<ErrorOutlineRoundedIcon />}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                {verificationError}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', mt: 0.25 }}>
                Please check the resident’s reservation pass or confirm identity.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <ButtonBase
            disabled={isVerifying}
            onClick={() => setVerifyModalOpen(false)}
            sx={{ px: 2, py: 0.85, borderRadius: '8px', color: '#64748b', fontSize: '0.8125rem', fontWeight: 700 }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            disabled={isVerifying || !inputPickupCode.trim()}
            onClick={handleVerifyPickup}
            sx={{
              px: 2.5,
              py: 0.85,
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': { backgroundColor: '#15803d' },
              '&.Mui-disabled': { backgroundColor: '#cbd5e1' },
            }}
          >
            {isVerifying && <CircularProgress size={14} color="inherit" />}
            <span>Confirm Pick-Up (Picked Up)</span>
          </ButtonBase>
        </DialogActions>
      </Dialog>
      </>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast?.severity || 'info'} variant="filled" onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminTransactionsPage
