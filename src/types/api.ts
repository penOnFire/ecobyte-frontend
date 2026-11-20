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
  firstName?: string
  middleName?: string | null
  lastName?: string
  suffix?: string | null
  email: string
  phone: string
  role?: string
  barangay: Barangay
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  redirectTo?: '/admin' | '/dashboard'
  user: User
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  fullName: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  email: string
  phone: string
  barangayId: string
  streetAddress?: string
  validIdType?: string
  idNumber?: string
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
  deviceModel?: string
  category?: string
  workingStatus?: 'yes' | 'no' | 'not_sure'
  powersOn: boolean
  displayIntact: boolean
  portsWorking: boolean
  visibleDamage: string[]
  otherDamage?: string
  missingParts: string[]
  otherMissing?: string
  notes?: string
}

export interface ResidentNotificationItem {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface SubsystemHealth {
  name: string
  status: 'OPTIMAL' | 'INTACT' | 'DEGRADED' | 'HEALTH_RISK'
  score: number
  details?: string
}

export interface HazardAlert {
  level: 'CRITICAL' | 'WARNING' | 'SAFE'
  title: string
  instructions: string
}

export interface DiagnosticResult {
  assessmentId: string
  deviceModel: string
  category?: string
  analysisSource?: 'ai_assisted' | 'rule_based_fallback'
  aiModel?: string
  confidenceScore?: number
  wasteClassification: string
  estimatedMassLabel?: string
  aiSummary?: string
  supportingDetails?: {
    workingStatus?: 'yes' | 'no' | 'not_sure'
    powersOn?: boolean
    displayIntact?: boolean
    portsWorking?: boolean
    visibleDamage?: string[]
    otherDamage?: string
    missingParts?: string[]
    otherMissing?: string
    notes?: string
  }
  hazardAlert: HazardAlert | null
  subsystems: SubsystemHealth[]
  recommendedRoute: 'REUSE' | 'DROP_OFF' | 'REPAIR'
  images?: Array<{
    id: string
    url: string
    angle?: string | null
  }>
}

export interface AssessedDeviceRecord {
  assessmentId: string
  itemId?: string
  deviceTitle: string
  category: string
  hazardLevel: 'HIGH_HAZARD' | 'LOW_RISK'
  hazardTitle: string
  handlingRecommendation: string
  assessedAt: string
  confidenceScore?: number
  analysisSource?: 'ai_assisted' | 'rule_based_fallback'
  aiSummary?: string
  images?: Array<{
    id: string
    url: string
    angle?: string | null
  }>
  notes?: string
  visibleDamage?: string[]
  missingParts?: string[]
  subsystems?: Array<{
    name: string
    status: string
    score: number
    details?: string
  }>
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
  | 'Cancelled'
  | 'Missed'

export interface EwasteRequestItem {
  requestId: string
  deviceTitle: string
  deviceCategory?: string
  siteName: string
  status: RequestLifecycleStatus
  statusStage: string
  progressStep: string
  progressPercent: number
  scheduledSlot: string
}

export interface UserReservationItem {
  reservationId: string
  itemTitle: string
  pickupCode: string
  siteName: string
  expiresAt: string | null
  status: 'Reserved' | 'Claimed' | 'Expired'
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
  location?: string
  distance?: string
  price?: string
  status?: 'Available' | 'Reserved' | 'Claimed'
  imageUrl?: string
  guaranteeDays?: number
  pickupHub?: {
    id: string
    name: string
    address: string
    operatingHours: string
    lockerBay: string
  }
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

