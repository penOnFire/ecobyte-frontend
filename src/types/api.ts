/**
 * EcoByte Core Domain Data Models & API Contracts
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown[]
}

// ── Auth & Resident Profile ──
export interface Barangay {
  id: string
  name: string
  city: string
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role?: string
  barangay: Barangay
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  barangayId: string
  password: string
}

// ── Multi-Angle AI Telemetry & Diagnostic ──
export type CameraAngle = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

export interface AngleUploadResult {
  sessionId: string
  uploadedAngle: CameraAngle
  opticalLockConfidence: number
  completedAngles: CameraAngle[]
  remainingAngles: CameraAngle[]
}

export interface DamageAssessmentPayload {
  sessionId: string
  powersOn: boolean
  displayIntact: boolean
  portsWorking: boolean
  visibleDamage: string[]
  missingParts: string[]
  notes?: string
}

export interface SubsystemHealth {
  name: string
  status: 'OPTIMAL' | 'INTACT' | 'DEGRADED' | 'HEALTH_RISK'
  score: number
}

export interface HazardAlert {
  level: 'CRITICAL' | 'WARNING' | 'SAFE'
  title: string
  instructions: string
}

export interface DiagnosticResult {
  assessmentId: string
  deviceModel: string
  wasteClassification: string
  hazardAlert: HazardAlert | null
  subsystems: SubsystemHealth[]
  recommendedRoute: 'REUSE' | 'DROP_OFF' | 'REPAIR'
}

// ── Drop-Off Hubs & Scheduling ──
export type HubFacilityType = 'Staffed & Smart Bin' | '24/7 Smart Bin' | 'Kiosk' | 'Staffed Only'

export interface DropOffSite {
  id: string
  name: string
  address: string
  distanceKm: number
  distance?: string
  status?: string
  hours: string
  type: HubFacilityType
  isOpen: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  hazmatAccredited?: boolean
}

export interface ScheduleBookingPayload {
  assessmentId?: string
  siteId: string
  scheduledDate: string
  timeSlot: string
  courierOrSelf: 'SELF_DROPOFF' | 'COURIER'
}

export type RequestLifecycleStatus =
  | 'Submitted'
  | 'Under review'
  | 'Scheduled'
  | 'Collected'
  | 'Turned over'

export interface EwasteRequestItem {
  requestId: string
  deviceTitle: string
  siteName: string
  status: RequestLifecycleStatus
  statusStage: string
  progressStep: string
  progressPercent: number
  scheduledSlot: string
}

// ── Reuse Hub Marketplace & Reservations ──
export type ReuseCategory = 'All' | 'Laptops' | 'Phones' | 'Chargers' | 'Peripherals'
export type ItemCondition = 'Inspected & Working' | 'Screen Replaced' | 'Safe & Tested' | 'Minor Bezel Scratch'

export interface ReuseItem {
  id: string
  title: string
  category: ReuseCategory
  itemCode?: string
  condition: string
  subcondition: string
  location: string
  distance: string
  price: string
  status: 'Available' | 'Reserved' | 'Claimed'
  imageUrl: string
  specs?: Record<string, string>
}

export interface ReservationBooking {
  reservationId: string
  pickupCode: string
  status: 'RESERVED' | 'CLAIMED' | 'EXPIRED'
  expiresAt: string
  hoursRemaining: number
  pickupLocation: {
    name: string
    address: string
    desk: string
  }
}

