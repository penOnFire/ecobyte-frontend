import { useEffect, useRef, useState, type ChangeEvent, type FC } from 'react'
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
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import { adminApi, getScopedOfficialBaseId, resolveMediaUrl, type AdminCollectionRequest } from '@/lib/api'

interface DeviceDetails {
  id: string
  requestCode: string
  linkedItemId?: string | null
  itemName: string
  type: string
  residentName: string
  siteName: string
  receivedAt: string
  status: string
  photos: {
    front: boolean
    back: boolean
    left: boolean
    right: boolean
  }
  photoUrls?: Partial<Record<'front' | 'back' | 'left' | 'right', string>>
  extraPhotoUrls?: Array<{ angleLabel: string; imageUrl: string }>
  checklist: {
    powersOn: string
    screen: string
    battery: string
    missingParts: string
    waterDamage: string
    notes?: string
  }
  assessment: {
    detectedType: string
    confidence: number
    hazard: 'Low' | 'Medium' | 'High'
    recommendation: string
    impactKg: number
    materials: string
    components: string[]
    wasteClassification?: string
    hazardTitle?: string
    hazardInstructions?: string | null
    estimatedMassLabel?: string
    summary?: string
    analysisSource?: string
    aiModel?: string
    subsystems?: Array<{
      name: string
      status: string
      score: number
      details?: string
      description?: string
    }>
  }
}

const findLocalDevice = (targetId?: string): DeviceDetails | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ecobyte_dropoff_requests')
    if (!raw) return null
    const parsed: any[] = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const scopedBaseId = getScopedOfficialBaseId()
    const list = scopedBaseId
      ? parsed.filter((d) => String(d?.residentBaseId ?? '') === scopedBaseId)
      : parsed
    if (list.length === 0) return null

    let match = targetId
      ? list.find((d) => d.id === targetId || d.requestCode === targetId)
      : list.find((d) => {
          const s = (d.status || '').toLowerCase()
          return s === 'under inspection' || s === 'under_inspection'
        })

    if (!match && !targetId && list.length > 0) {
      match = list[0]
    }

    if (match) {
      return {
        id: match.id,
        requestCode: match.requestCode || match.id,
        itemName: match.itemName || match.preferredMethod || 'Resident E-Waste Device',
        type: match.type || 'Electronics',
        residentName: match.residentName || 'Resident User',
        siteName: match.siteName || 'Commonwealth Central MRF (Base 1)',
        receivedAt: match.receivedAt || match.date || 'Today',
        status: 'Under Inspection',
        photos: { front: true, back: true, left: true, right: false },
        checklist: {
          powersOn: match.assessment?.checklist?.powersOn || 'Yes',
          screen: match.assessment?.checklist?.screen || 'Good',
          battery: match.assessment?.checklist?.battery || 'Standard',
          missingParts: match.assessment?.checklist?.missingParts || 'None',
          waterDamage: match.assessment?.checklist?.waterDamage || 'No',
          notes: match.assessment?.checklist?.notes || match.displayStatus || '',
        },
        assessment: {
          detectedType: match.assessment?.detectedType || match.type || 'Electronic Hardware',
          confidence: match.assessment?.confidence || 92,
          hazard: match.assessment?.hazard || 'Low',
          recommendation: match.assessment?.recommendation || 'Repair & Reuse',
          impactKg: match.assessment?.impact?.kg || 1.5,
          materials: match.assessment?.impact?.materials || 'Recoverable metals · Plastics',
          components: ['Mainboard', 'Power Supply', 'Chassis'],
        },
      }
    }
  } catch {
    // ignore
  }
  return null
}

export const AdminPhysicalInspectionPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [device, setDevice] = useState<DeviceDetails | null>(() => findLocalDevice(id))
  const [works, setWorks] = useState<'Yes' | 'Partially' | 'No' | ''>('')
  const [condition, setCondition] = useState<'Good' | 'Fair' | 'Poor' | 'Damaged' | ''>('')
  const [notes, setNotes] = useState('')
  const [decision, setDecision] = useState<'reuse' | 'dispose' | ''>('')
  const [inspectorPhotos, setInspectorPhotos] = useState<string[]>([])
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [cameraModalOpen, setCameraModalOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCameraStream = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    let active = true

    const applyRequestsFallback = () => {
      adminApi
        .getRequests()
        .then((data: AdminCollectionRequest[]) => {
          if (!active || !Array.isArray(data)) return
          const found = id
            ? data.find((d) => d.id === id || d.requestCode === id)
            : data.find((d) => (d.status || '').toLowerCase() === 'under_inspection')
          if (!found) {
            setDevice(null)
            return
          }
          const reqPhotos = found.photos ?? []
          const photoUrls: Partial<Record<'front' | 'back' | 'left' | 'right', string>> = {}
          for (const p of reqPhotos) {
            const key = (p.angleLabel || '').toLowerCase()
            if (key === 'front' || key === 'back' || key === 'left' || key === 'right') {
              if (!photoUrls[key]) photoUrls[key] = p.imageUrl
            }
          }
          if (!photoUrls.front && found.imageUrl) {
            photoUrls.front = found.imageUrl
          }

          setDevice({
            id: found.id,
            requestCode: found.requestCode || found.id,
            linkedItemId: found.linkedItemId || null,
            itemName: found.itemName || found.preferredMethod || 'Resident E-Waste Device',
            type: found.itemCategory || found.preferredMethod || 'Electronics',
            residentName: found.residentName || 'Resident User',
            siteName: found.siteName || 'Commonwealth Central MRF (Base 1)',
            receivedAt: found.requestedDate || 'Today',
            status: 'Under Inspection',
            photos: {
              front: Boolean(photoUrls.front),
              back: Boolean(photoUrls.back),
              left: Boolean(photoUrls.left),
              right: Boolean(photoUrls.right),
            },
            photoUrls,
            extraPhotoUrls: reqPhotos,
            checklist: {
              powersOn: 'Yes',
              screen: 'Good',
              battery: 'Standard',
              missingParts: 'None',
              waterDamage: 'No',
              notes: found.displayStatus || '',
            },
            assessment: {
              detectedType: found.preferredMethod || 'Electronic Unit',
              confidence: 92,
              hazard: (found.preferredMethod || '').toLowerCase().includes('battery') ? 'High' : 'Low',
              recommendation: 'Repair & Reuse',
              impactKg: 2.5,
              materials: 'Recoverable metals · Plastics · Silicon',
              components: ['Chassis', 'Power Supply', 'Logic Board'],
            },
          })
        })
        .catch((err) => {
          console.warn('Could not load specific request from API:', err)
        })
    }

    if (id) {
      adminApi
        .getInspectionDetails(id)
        .then((details) => {
          if (!active || !details) return
          const residentPhotos = details.residentAssessment?.photos ?? []
          const photoUrls: Partial<Record<'front' | 'back' | 'left' | 'right', string>> = {}
          for (const p of residentPhotos) {
            const key = (p.angleLabel || '').toLowerCase()
            if (key === 'front' || key === 'back' || key === 'left' || key === 'right') {
              if (!photoUrls[key]) photoUrls[key] = p.imageUrl
            }
          }
          if (!photoUrls.front && residentPhotos[0]?.imageUrl) {
            photoUrls.front = residentPhotos[0].imageUrl
          }

          const dmg = details.residentAssessment?.visibleDamage ?? details.reportedCondition?.visibleDamage ?? []
          const missing = (details.residentAssessment?.missingParts ?? []).filter((m) => m && m !== 'none')
          const rawHazard = (details.residentAssessment?.hazardLevel || '').toLowerCase()
          const hazard: 'Low' | 'Medium' | 'High' =
            rawHazard === 'high' || rawHazard === 'critical'
              ? 'High'
              : rawHazard === 'medium'
                ? 'Medium'
                : 'Low'
          const rawRoute = (details.residentAssessment?.recommendedRoute || '').toUpperCase()
          const recommendation =
            rawRoute === 'DROP_OFF'
              ? 'Safe Disposal'
              : rawRoute === 'REUSE'
                ? 'Repair & Reuse'
                : 'Refurbish'

          setDevice({
            id: details.requestInfo?.requestId || id,
            requestCode: details.requestInfo?.requestCode || details.serialNumber || id,
            linkedItemId: details.id,
            itemName: details.deviceModel || 'Resident E-Waste Device',
            type: details.category || details.requestInfo?.deviceCategory || 'Electronics',
            residentName: details.resident?.name || 'Resident User',
            siteName: details.requestInfo?.dropOffSite || details.resident?.barangay || 'Commonwealth Central MRF (Base 1)',
            receivedAt: details.requestInfo?.collectedAt
              ? details.requestInfo.collectedAt.slice(0, 10)
              : details.intakeDate?.slice(0, 10) || 'Today',
            status: 'Under Inspection',
            photos: {
              front: Boolean(photoUrls.front),
              back: Boolean(photoUrls.back),
              left: Boolean(photoUrls.left),
              right: Boolean(photoUrls.right),
            },
            photoUrls,
            extraPhotoUrls: residentPhotos,
            checklist: {
              powersOn: details.residentAssessment?.powersOn ? 'Yes' : 'No',
              screen: details.residentAssessment?.displayIntact === false ? 'Damaged' : 'Good',
              battery: dmg.some((d) => d.includes('swollen'))
                ? 'Swollen'
                : dmg.some((d) => d.includes('leak'))
                  ? 'Leaking'
                  : 'Standard',
              missingParts: missing.length > 0 ? missing.join(', ') : 'None',
              waterDamage: dmg.some((d) => d.includes('water')) ? 'Yes' : 'No',
              notes: details.residentAssessment?.notes || details.benchNotes || '',
            },
            assessment: (() => {
              const ai = details.residentAssessment?.aiAnalysis
              const conf =
                typeof ai?.confidenceScore === 'number'
                  ? Math.round(ai.confidenceScore > 1 ? ai.confidenceScore : ai.confidenceScore * 100)
                  : 92
              const subs = Array.isArray(ai?.subsystems) ? ai.subsystems : []
              return {
                detectedType: ai?.detectedModel || details.deviceModel || details.category || 'Electronic Unit',
                confidence: conf,
                hazard,
                recommendation,
                impactKg: 2.5,
                materials: ai?.estimatedMassLabel || 'Recoverable metals · Plastics · Silicon',
                components:
                  subs.length > 0
                    ? subs.map((s) => s.name)
                    : ['Battery Cell', 'Display & Glass', 'Logic Board', 'Enclosure & Ports'],
                wasteClassification: ai?.wasteClassification,
                hazardTitle: ai?.hazardTitle,
                hazardInstructions: ai?.hazardInstructions,
                estimatedMassLabel: ai?.estimatedMassLabel,
                summary: ai?.summary,
                analysisSource: ai?.analysisSource,
                aiModel: ai?.aiModel,
                subsystems: subs,
              }
            })(),
          })

          if (details.previousInspection?.inspectorPhotos?.length) {
            setInspectorPhotos(details.previousInspection.inspectorPhotos)
          }
        })
        .catch(() => {
          applyRequestsFallback()
        })
    } else {
      applyRequestsFallback()
    }

    return () => {
      active = false
      stopCameraStream()
    }
  }, [id])

  const uploadOfficialPhotoFile = async (file: File) => {
    if (!device) return
    const mime = (file.type || '').trim().toLowerCase()
    const ext = file.name?.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
    const isAllowedFormat =
      mime === 'image/jpeg' ||
      mime === 'image/jpg' ||
      mime === 'image/png' ||
      ext === 'jpg' ||
      ext === 'jpeg' ||
      ext === 'png'
    if (!isAllowedFormat) {
      setPhotoError('Only JPG, JPEG, and PNG image files are allowed.')
      return
    }
    if (file.size === 0) {
      setPhotoError('The selected image file is empty.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image exceeds the 10MB maximum limit.')
      return
    }

    setPhotoError(null)
    setFormError(null)
    setIsUploadingPhoto(true)
    try {
      const targetId = device.linkedItemId || device.id
      const res = await adminApi.uploadInspectionPhoto(targetId, file)
      if (res?.url) {
        setInspectorPhotos((prev) => (prev.includes(res.url) ? prev : [...prev, res.url]))
      }
    } catch (err: any) {
      setPhotoError(err?.message || 'Failed to upload official inspection image.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await uploadOfficialPhotoFile(file)
  }

  const handleOpenCamera = async () => {
    setCameraError(null)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPhotoError('Camera capture is not supported in this browser. Please upload an image instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCameraModalOpen(true)
    } catch {
      setPhotoError('Unable to access camera. Please allow camera permission or upload an image file.')
    }
  }

  const handleCloseCamera = () => {
    stopCameraStream()
    setCameraModalOpen(false)
    setCameraError(null)
  }

  const handleCaptureFromCamera = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera stream is not ready yet. Please wait a moment and try again.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setCameraError('Could not initialize image capture.')
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    )
    if (!blob) {
      setCameraError('Failed to capture image frame.')
      return
    }
    const capturedFile = new File([blob], `inspection-capture-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    })
    handleCloseCamera()
    await uploadOfficialPhotoFile(capturedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!device) return
    if (!works) {
      setFormError('Please indicate whether the device works.')
      return
    }
    if (!condition) {
      setFormError('Please select the physical condition.')
      return
    }
    if (!decision) {
      setFormError('Please choose a routing decision (List in Reuse Hub or Mark for Disposal).')
      return
    }
    if (inspectorPhotos.length === 0) {
      setFormError('Please upload or capture an official device photo before saving the decision & turn over.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const targetId = device.linkedItemId || device.id
      await adminApi.submitInspectionVerdict(targetId, {
        action: decision === 'reuse' ? 'REUSE' : 'DISPOSAL',
        conditionGrade: condition,
        benchNotes: notes || `Inspected: Works: ${works}, Condition: ${condition}`,
        inspectorAssessment: {
          actualCondition: condition,
          remarks: notes || `Inspected: Works: ${works}, Condition: ${condition}`,
          inspectorPhotos,
        },
      })

      // Also ensure the collection request status is marked turned_over on backend
      if (device.id) {
        await adminApi.updateRequestStatus(device.id, 'turned_over').catch(() => {})
      }

      // Sync with localStorage
      try {
        const storedReqs = JSON.parse(localStorage.getItem('ecobyte_dropoff_requests') || '[]')
        const updatedReqs = storedReqs.map((r: any) =>
          r.id === device.id || r.requestCode === device.requestCode || r.id === device.requestCode || r.requestCode === device.id
            ? { ...r, status: 'Turned Over' }
            : r
        )
        localStorage.setItem('ecobyte_dropoff_requests', JSON.stringify(updatedReqs))

        if (decision === 'reuse') {
          const storedListings = JSON.parse(localStorage.getItem('ecobyte_reuse_listings') || '[]')
          const newListing = {
            id: `RH-${Math.floor(1000 + Math.random() * 9000)}`,
            itemName: device.itemName,
            type: device.type,
            condition,
            barangay: 'Commonwealth',
            siteName: device.siteName,
            listedAt: new Date().toISOString().slice(0, 10),
            status: 'Available',
            imageUrl: inspectorPhotos[0],
          }
          localStorage.setItem('ecobyte_reuse_listings', JSON.stringify([newListing, ...storedListings]))
        } else {
          const storedDisposals = JSON.parse(localStorage.getItem('ecobyte_disposal_records') || '[]')
          const newDisposal = {
            id: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
            itemName: device.itemName,
            type: device.type,
            requestId: device.requestCode || device.id,
            hazard: device.assessment.hazard,
            reason: notes || `Failed diagnostics: Works: ${works}, Condition: ${condition}`,
            by: 'Barangay Official',
            barangay: 'Commonwealth',
            at: new Date().toISOString().slice(0, 10),
            kg: device.assessment.impactKg || 1.5,
          }
          localStorage.setItem('ecobyte_disposal_records', JSON.stringify([newDisposal, ...storedDisposals]))
        }

        const existingLogs = JSON.parse(localStorage.getItem('ecobyte_activity_logs') || '[]')
        const logEntry = {
          id: `log-${Date.now()}`,
          ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
          userId: 'staff',
          userName: 'Barangay Official',
          role: 'official',
          action: decision === 'reuse' ? 'Inspected device → Listed in Reuse Hub' : 'Inspected device → Marked for disposal',
          target: device.requestCode || device.id,
          details: `${device.itemName} (${condition})`,
          barangay: 'Commonwealth',
        }
        localStorage.setItem('ecobyte_activity_logs', JSON.stringify([logEntry, ...existingLogs.slice(0, 50)]))
      } catch (syncErr) {
        console.warn('Failed to sync inspection locally:', syncErr)
      }

      setToast({
        message:
          decision === 'reuse'
            ? `Inspection completed! ${device.itemName} is now listed in the Reuse Hub.`
            : `Inspection completed! Disposal record created for ${device.itemName}.`,
        severity: 'success',
      })
      window.dispatchEvent(new Event('ecobyte:admin-badges-refresh'))

      setTimeout(() => {
        navigate('/admin/to-inspect')
      }, 1200)
    } catch {
      setToast({
        message: 'Failed to save inspection verdict.',
        severity: 'error',
      })
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase()
    if (lower.includes('phone')) return SmartphoneRoundedIcon
    if (lower.includes('laptop')) return LaptopRoundedIcon
    if (lower.includes('battery')) return BatteryChargingFullRoundedIcon
    if (lower.includes('monitor') || lower.includes('tv')) return TvRoundedIcon
    if (lower.includes('cable') || lower.includes('charger') || lower.includes('keyboard')) return CableRoundedIcon
    return KitchenRoundedIcon
  }

  if (!device) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
        <ButtonBase
          onClick={() => navigate('/admin/to-inspect')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 700,
            width: 'fit-content',
            '&:hover': { color: '#0f172a' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          <span>Inspection Queue</span>
        </ButtonBase>
        <Box sx={{ p: 6, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #dbe3d6' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', mb: 1 }}>
            No Device Selected for Inspection
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 3 }}>
            Please select an incoming device from the Inspection Queue to conduct physical diagnostics.
          </Typography>
          <ButtonBase
            onClick={() => navigate('/admin/to-inspect')}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: '0.75rem',
              backgroundColor: '#70b822',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            Open Inspection Queue
          </ButtonBase>
        </Box>
      </Box>
    )
  }

  const ItemIcon = getTypeIcon(device.type)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Breadcrumb / Back Link ── */}
      <ButtonBase
        onClick={() => navigate('/admin/to-inspect')}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: 700,
          width: 'fit-content',
          '&:hover': { color: '#0f172a' },
        }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        <span>Inspection Queue</span>
      </ButtonBase>

      {/* ── 2-Column Grid matching inspectionForm(u, id) in Prototype ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '3fr 2fr' }, gap: 3, alignItems: 'start' }}>
        {/* Left Column: Device Card & AI Assessment Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Card 1: Device Details & Photos */}
          <Box
            sx={{
              p: 3,
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Device Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
                  {device.itemName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                  {device.type} · <span style={{ fontFamily: 'monospace' }}>{device.id}</span> · {device.siteName}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                }}
              >
                {device.status}
              </Box>
            </Box>

            {/* 4 Photos Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
              {[
                { key: 'front' as const, label: 'Front', ok: device.photos.front, req: true },
                { key: 'back' as const, label: 'Back', ok: device.photos.back, req: true },
                { key: 'left' as const, label: 'Left', ok: device.photos.left, req: false },
                { key: 'right' as const, label: 'Right', ok: device.photos.right, req: false },
              ].map((p) => {
                const imgUrl = device.photoUrls?.[p.key]
                return (
                  <Box
                    key={p.label}
                    onClick={() => {
                      if (imgUrl) setPreviewPhotoUrl(resolveMediaUrl(imgUrl))
                    }}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      border: imgUrl ? '1px solid #cbd5e1' : p.ok ? '1px solid #dbe3d6' : '1px dashed #cbd5e1',
                      backgroundColor: p.ok ? '#f8faf6' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      p: imgUrl ? 0 : 1,
                      cursor: imgUrl ? 'pointer' : 'default',
                    }}
                  >
                    {imgUrl ? (
                      <>
                        <Box
                          component="img"
                          src={resolveMediaUrl(imgUrl)}
                          alt={`${device.itemName} ${p.label}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 6,
                            left: 6,
                            px: 0.85,
                            py: 0.2,
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(15, 23, 42, 0.72)',
                            color: '#ffffff',
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {p.label}
                        </Box>
                      </>
                    ) : (
                      <>
                        <ItemIcon sx={{ fontSize: 28, color: p.ok ? '#2e6022' : '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                          {p.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: p.ok ? '#2e6022' : '#94a3b8' }}>
                          {p.ok ? 'Uploaded' : p.req ? 'Missing' : 'Optional · none'}
                        </Typography>
                      </>
                    )}
                  </Box>
                )
              })}
            </Box>

            {/* Resident & Received Timestamp */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box sx={{ p: 1.75, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Resident
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {device.residentName}
                </Typography>
              </Box>

              <Box sx={{ p: 1.75, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Received
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {device.receivedAt}
                </Typography>
              </Box>
            </Box>

            {/* Resident Condition Checklist */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1 }}>
                Resident Condition Checklist
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                {[
                  ['Powers on', device.checklist.powersOn],
                  ['Screen', device.checklist.screen],
                  ['Battery', device.checklist.battery],
                  ['Missing', device.checklist.missingParts],
                  ['Water dmg.', device.checklist.waterDamage],
                ].map(([k, v]) => {
                  const isAlert = ['Swollen', 'Leaking'].includes(v) || (k === 'Water dmg.' && v === 'Yes')
                  return (
                    <Box
                      key={k}
                      sx={{
                        p: 1.25,
                        borderRadius: '0.75rem',
                        border: `1px solid ${isAlert ? '#fecdd3' : '#dbe3d6'}`,
                        backgroundColor: isAlert ? '#fff1f2' : '#ffffff',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                        {k}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: isAlert ? '#be123c' : '#0f172a', mt: 0.25 }}>
                        {v}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
              {device.checklist.notes && (
                <Typography sx={{ mt: 1.5, p: 1.5, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6', fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                  “{device.checklist.notes}”
                </Typography>
              )}
            </Box>
          </Box>

          {/* Card 2: AI Assessment (Reference Only) */}
          <Box
            sx={{
              p: 3,
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyRoundedIcon sx={{ fontSize: 20, color: '#2e6022' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                AI assessment
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                (reference only)
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {/* Detected type */}
              <Box sx={{ p: 2, borderRadius: '0.75rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Detected type
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
                  {device.assessment.detectedType}
                </Typography>
                <Box sx={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: '9999px', mt: 1.5, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${device.assessment.confidence}%`, backgroundColor: '#2e6022', borderRadius: '9999px' }} />
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                  {device.assessment.confidence}% confidence
                </Typography>
                {device.assessment.wasteClassification && (
                  <Typography sx={{ fontSize: '0.6875rem', color: '#334155', fontWeight: 700, mt: 0.5 }}>
                    {device.assessment.wasteClassification}
                  </Typography>
                )}
              </Box>

              {/* Potential health risk */}
              <Box sx={{ p: 2, borderRadius: '0.75rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Potential health risk
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.25,
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    mt: 0.5,
                    backgroundColor: device.assessment.hazard === 'High' ? '#fff1f2' : '#f0fdf4',
                    color: device.assessment.hazard === 'High' ? '#be123c' : '#15803d',
                    border: `1px solid ${device.assessment.hazard === 'High' ? '#fecdd3' : '#bbf7d0'}`,
                  }}
                >
                  {device.assessment.hazard} Hazard
                </Box>
                {device.assessment.hazardTitle && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 700, mt: 0.75 }}>
                    {device.assessment.hazardTitle}
                  </Typography>
                )}
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mt: 0.75 }}>
                  {device.assessment.materials}
                </Typography>
              </Box>

              {/* Stage 1 recommendation */}
              <Box sx={{ p: 2, borderRadius: '0.75rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Stage 1 recommendation
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  {device.assessment.recommendation}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mt: 1 }}>
                  {device.assessment.estimatedMassLabel || `Est. ${device.assessment.impactKg} kg diverted`}
                </Typography>
                {device.assessment.analysisSource && (
                  <Typography sx={{ fontSize: '0.625rem', color: '#475569', fontWeight: 700, mt: 0.5 }}>
                    Source: {device.assessment.analysisSource === 'ai_assisted' ? 'AI-Assisted Vision' : 'Automated Triage'}
                  </Typography>
                )}
              </Box>
            </Box>

            {device.assessment.summary && (
              <Box sx={{ p: 1.75, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#2e6022', textTransform: 'uppercase', mb: 0.5 }}>
                  AI Diagnostic Summary
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                  {device.assessment.summary}
                </Typography>
                {device.assessment.hazardInstructions && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 700, mt: 0.75 }}>
                    Handling Note: {device.assessment.hazardInstructions}
                  </Typography>
                )}
              </Box>
            )}

            {/* Detected components / AI Subsystem Breakdown */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1 }}>
                Component Condition Breakdown ({device.assessment.subsystems && device.assessment.subsystems.length > 0 ? device.assessment.subsystems.length : device.assessment.components.length})
              </Typography>
              {device.assessment.subsystems && device.assessment.subsystems.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {device.assessment.subsystems.map((sub) => {
                    const isRisk = sub.status === 'HEALTH_RISK'
                    const isWarn = sub.status === 'DEGRADED'
                    return (
                      <Box
                        key={sub.name}
                        sx={{
                          p: 1.5,
                          borderRadius: '0.75rem',
                          border: `1px solid ${isRisk ? '#fecdd3' : isWarn ? '#fde68a' : '#dbe3d6'}`,
                          backgroundColor: isRisk ? '#fff1f2' : isWarn ? '#fffbeb' : '#f8faf6',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                            {sub.name} ({sub.score}%)
                          </Typography>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.2,
                              borderRadius: '9999px',
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              backgroundColor: isRisk ? '#fee2e2' : isWarn ? '#fef3c7' : '#dcfce7',
                              color: isRisk ? '#be123c' : isWarn ? '#b45309' : '#15803d',
                            }}
                          >
                            {sub.status}
                          </Box>
                        </Box>
                        {(sub.description || sub.details) && (
                          <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, mt: 0.5, lineHeight: 1.45 }}>
                            {sub.description || sub.details}
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {device.assessment.components.map((comp) => (
                  <Box
                    key={comp}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {comp}
                  </Box>
                ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Column: Physical Inspection Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            position: { xl: 'sticky' },
            top: { xl: 24 },
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Physical inspection form
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
              Stage 2 · Barangay Official
            </Typography>
          </Box>

          {/* Question 1: Does the device work? */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Does the device work?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {(['Yes', 'Partially', 'No'] as const).map((opt) => {
                const selected = works === opt
                return (
                  <ButtonBase
                    key={opt}
                    type="button"
                    onClick={() => setWorks(opt)}
                    sx={{
                      p: 1.5,
                      borderRadius: '0.75rem',
                      border: selected ? '2px solid #2e6022' : '1px solid #dbe3d6',
                      backgroundColor: selected ? '#f1f4f0' : '#ffffff',
                      color: selected ? '#2e6022' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: selected ? '4px solid #2e6022' : '2px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <span>{opt}</span>
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>

          {/* Question 2: Physical condition */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Physical condition
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {(['Good', 'Fair', 'Poor', 'Damaged'] as const).map((opt) => {
                const selected = condition === opt
                return (
                  <ButtonBase
                    key={opt}
                    type="button"
                    onClick={() => setCondition(opt)}
                    sx={{
                      p: 1.5,
                      borderRadius: '0.75rem',
                      border: selected ? '2px solid #2e6022' : '1px solid #dbe3d6',
                      backgroundColor: selected ? '#f1f4f0' : '#ffffff',
                      color: selected ? '#2e6022' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: selected ? '4px solid #2e6022' : '2px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                      }}
                    />
                    <span>{opt}</span>
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>

          {/* Question 3: Inspection notes */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Inspection notes
            </Typography>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tested OK, battery holds charge, minor scratches"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '0.75rem',
                border: '1px solid #dbe3d6',
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </Box>

          {/* Question 4: Official Device Photo (Upload or Capture Required) */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 0.5 }}>
              Official device photo (Required before turnover)
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mb: 1.25 }}>
              Upload a JPG/PNG photo or capture a live photo of the inspected device. Approved Reuse Hub items display this photo.
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <ButtonBase
                type="button"
                disabled={isUploadingPhoto || isSubmitting}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 1.35,
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#94a3b8' },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                <CloudUploadRoundedIcon sx={{ fontSize: 18, color: '#2e6022' }} />
                <span>Upload Image</span>
              </ButtonBase>

              <ButtonBase
                type="button"
                disabled={isUploadingPhoto || isSubmitting}
                onClick={handleOpenCamera}
                sx={{
                  p: 1.35,
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#94a3b8' },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 18, color: '#2e6022' }} />
                <span>Capture Photo</span>
              </ButtonBase>
            </Box>

            {isUploadingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25, color: '#2e6022', fontSize: '0.75rem', fontWeight: 700 }}>
                <CircularProgress size={16} sx={{ color: '#2e6022' }} />
                <span>Uploading official inspection photo...</span>
              </Box>
            )}

            {photoError && (
              <Alert severity="error" sx={{ mt: 1.25, borderRadius: '0.75rem', fontSize: '0.75rem' }}>
                {photoError}
              </Alert>
            )}

            {inspectorPhotos.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1.5 }}>
                {inspectorPhotos.map((url, idx) => (
                  <Box
                    key={url}
                    sx={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#f0fdf4',
                      aspectRatio: '1/1',
                    }}
                  >
                    <Box
                      component="img"
                      src={resolveMediaUrl(url)}
                      alt={`Official inspection ${idx + 1}`}
                      onClick={() => setPreviewPhotoUrl(resolveMediaUrl(url))}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        cursor: 'pointer',
                      }}
                    />
                    <IconButton
                      size="small"
                      aria-label="Remove photo"
                      onClick={() => setInspectorPhotos((prev) => prev.filter((item) => item !== url))}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        backgroundColor: 'rgba(15, 23, 42, 0.72)',
                        color: '#ffffff',
                        '&:hover': { backgroundColor: '#dc2626' },
                      }}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Question 5: Routing decision */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Routing decision
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Option 1: Reuse Hub */}
              <ButtonBase
                type="button"
                onClick={() => setDecision('reuse')}
                sx={{
                  p: 1.75,
                  borderRadius: '0.75rem',
                  border: decision === 'reuse' ? '2px solid #2e6022' : '1px solid #dbe3d6',
                  backgroundColor: decision === 'reuse' ? '#f1f4f0' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: decision === 'reuse' ? '5px solid #2e6022' : '2px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    flexShrink: 0,
                  }}
                />
                <StorefrontRoundedIcon sx={{ fontSize: 22, color: decision === 'reuse' ? '#2e6022' : '#64748b' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                    List in Reuse Hub
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    Creates an Available listing residents can reserve
                  </Typography>
                </Box>
              </ButtonBase>

              {/* Option 2: Mark for Disposal */}
              <ButtonBase
                type="button"
                onClick={() => setDecision('dispose')}
                sx={{
                  p: 1.75,
                  borderRadius: '0.75rem',
                  border: decision === 'dispose' ? '2px solid #be123c' : '1px solid #dbe3d6',
                  backgroundColor: decision === 'dispose' ? '#fff1f2' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: decision === 'dispose' ? '5px solid #be123c' : '2px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    flexShrink: 0,
                  }}
                />
                <DeleteForeverRoundedIcon sx={{ fontSize: 22, color: decision === 'dispose' ? '#be123c' : '#64748b' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                    Mark for Disposal
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    Creates a formal disposal record
                  </Typography>
                </Box>
              </ButtonBase>
            </Box>
          </Box>

          {/* High risk alert */}
          {device.assessment.hazard === 'High' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1.5,
                borderRadius: '0.75rem',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
              <span>High-risk item. Handle batteries with gloves and store in the designated hazardous bin.</span>
            </Box>
          )}

          {/* Error alert */}
          {formError && (
            <Alert severity="error" sx={{ borderRadius: '0.75rem', fontSize: '0.8125rem' }}>
              {formError}
            </Alert>
          )}

          {/* Submit Button */}
          <ButtonBase
            type="submit"
            disabled={isSubmitting || isUploadingPhoto}
            sx={{
              width: '100%',
              height: 46,
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              boxShadow: '0 2px 4px rgba(46, 96, 34, 0.25)',
              transition: 'opacity 0.15s ease',
              '&:hover': { opacity: 0.95 },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {isSubmitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <TaskAltRoundedIcon sx={{ fontSize: 20 }} />}
            <span>Save decision &amp; turn over</span>
          </ButtonBase>
        </Box>
      </Box>

      {/* Live Camera Capture Dialog */}
      <Dialog open={cameraModalOpen} onClose={handleCloseCamera} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
          <span>Capture Official Device Photo</span>
          <IconButton size="small" onClick={handleCloseCamera} aria-label="Close camera">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {cameraError && (
            <Alert severity="error" sx={{ borderRadius: '0.75rem' }}>
              {cameraError}
            </Alert>
          )}
          <Box
            sx={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '0.875rem',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
            }}
          >
            <video
              ref={(el) => {
                videoRef.current = el
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current
                  el.play().catch(() => {})
                }
              }}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <ButtonBase
            type="button"
            onClick={handleCloseCamera}
            sx={{
              px: 2.25,
              py: 1,
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            type="button"
            onClick={handleCaptureFromCamera}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '0.75rem',
              backgroundColor: '#2e6022',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
            <span>Capture Photo</span>
          </ButtonBase>
        </DialogActions>
      </Dialog>

      {/* Photo Zoom Lightbox Dialog */}
      <Dialog open={Boolean(previewPhotoUrl)} onClose={() => setPreviewPhotoUrl(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
          <span>Device Photo Preview</span>
          <IconButton size="small" onClick={() => setPreviewPhotoUrl(null)} aria-label="Close preview">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewPhotoUrl && (
            <Box
              component="img"
              src={previewPhotoUrl}
              alt="Device inspection preview"
              sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '0.75rem', backgroundColor: '#0f172a' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Snackbar Feedback ── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: '0.75rem' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}
