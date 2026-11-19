import { apiFetch } from './client'

export type BackendUserRole =
  | 'RESIDENT'
  | 'OFFICIAL'
  | 'BARANGAY_OFFICIAL'
  | 'ADMIN'
  | 'Admin'
  | 'Official'
  | 'Deactivated'

export interface BackendUserRecord {
  id: string
  email: string
  name?: string
  fullName?: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  phone?: string
  idCode?: string
  role: BackendUserRole
  department?: string
  unitAreaId?: number
  status?: 'Active' | 'Suspended' | 'Deactivated'
  accountStatus?: string
  twoFactorEnabled?: boolean
  mustChangePassword?: boolean
  notes?: string
  lastActive?: string
  isSelf?: boolean
  initials?: string
  barangay?: {
    id: string
    name: string
    city: string
  }
  createdAt?: string
}

export interface CreateAdminUserPayload {
  fullName?: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  email: string
  role?: string
  phone?: string
  idCode?: string
  department?: string
  unitAreaId?: number | string
  barangayId?: string | number
  status?: string
  twoFactorEnabled?: boolean
  mustChangePassword?: boolean
  notes?: string
  password?: string
}

export type UpdateAdminUserPayload = Partial<CreateAdminUserPayload>

export interface AdminCollectionRequest {
  id: string
  requestCode: string
  residentName: string
  residentEmail: string
  contactNumber: string
  residentBaseId?: string
  residentBaseName?: string
  siteName: string
  address: string
  preferredMethod: string
  status: string
  displayStatus: string
  scheduledSlot: string
  requestedAt: string
  requestedDate: string
  relativeDate: string
  linkedItemId: string | null
  linkedItemStatus: string | null
}

export interface AdminInspectionQueueItem {
  id: string
  name: string
  serial: string
  specs: string
  category?: string
  baseId?: string
  baseName?: string
  status?: string
  queueBucket?: 'waiting' | 'inspected'
  date: string
  relativeDate: string
  risk: 'High Risk' | 'Medium Risk' | 'Low Risk'
  suggestion: string
}

export interface AdminTransactionItem {
  id: string
  rawId: string
  transactionNumber: string
  type: 'Drop-Off' | 'Reuse Pick-Up'
  itemName: string
  category: string
  residentName: string
  residentEmail: string
  residentPhone?: string
  siteName: string
  dateSlot: string
  status: string
  displayStatus: string
  pickupCode?: string
  createdAt: string
}

export interface AdminReportsData {
  totals: {
    totalVolumeProcessed: number
    totalWeightKg: number
    divertedKgTotal: number
    activeRequests: number
    completedRequests: number
    missedRequests: number
    diversionRatePct: number
  }
  ewasteType: Array<{
    name: string
    units: number
    weightKg: number
    hazardUnits: number
    reuseRatePercent: number
  }>
  requests: {
    total: number
    scheduled: number
    underInspection: number
    turnedOver: number
    completed: number
    missed: number
    cancelled: number
    fulfillmentRatePct: number
  }
  slotUsage: Array<{
    facility: string
    capacity: number
    booked: number
    available: number
    utilizationPct: number
  }>
  reuseHub: {
    totalListed: number
    reserved: number
    claimed: number
    conversionRatePct: number
    avgHoldDays: string
  }
}

export interface AdminActivityLogItem {
  id: string
  entityType: string
  entityId: string
  oldStatus?: string | null
  newStatus: string
  action: string
  operator: {
    id: string
    name: string
    email: string
    role: string
  } | null
  notes: string | null
  timestamp: string
}

export type InspectionRoutingAction =
  | 'REUSE'
  | 'REPAIR'
  | 'DISPOSAL'
  | 'HAZARDOUS'
  | 'PENDING_INSPECTION'

export interface InspectorAssessmentPayload {
  actualCondition?: string
  matchesDescription?: 'yes' | 'partially' | 'no'
  observedDamage?: string[]
  missingComponents?: string[]
  batterySafety?: 'safe' | 'swollen' | 'leaking' | 'missing' | 'not_applicable'
  inspectorPhotos?: string[]
  remarks?: string
}

export interface AdminInspectionDetails {
  id: string
  deviceModel: string
  category?: string
  serialNumber: string
  intakeDate: string
  currentStatus?: string
  resident: {
    name: string
    email?: string
    phone?: string
    barangay: string
  }
  requestInfo?: {
    requestId: string | null
    requestCode: string | null
    dropOffSite: string
    scheduledSlot: string
    requestStatus: string
    collectionStatus: string
    collectedAt?: string | null
    deviceCategory: string
  }
  residentAssessment?: {
    workingStatus: 'yes' | 'no' | 'not_sure'
    powersOn: boolean
    displayIntact: boolean
    portsWorking: boolean
    visibleDamage: string[]
    otherDamage?: string
    missingParts: string[]
    otherMissing?: string
    notes: string
    recommendedRoute: string
    hazardLevel: string
    photos: Array<{
      id: string
      angleLabel: string
      imageUrl: string
    }>
  }
  previousInspection?: {
    inspectionId: string
    finalDecision: string
    inspectedAt: string
    inspectorName?: string
    action?: InspectionRoutingAction
    actualCondition?: string
    matchesDescription?: 'yes' | 'partially' | 'no'
    observedDamage?: string[]
    missingComponents?: string[]
    batterySafety?: 'safe' | 'swollen' | 'leaking' | 'missing' | 'not_applicable'
    inspectorPhotos?: string[]
    remarks?: string
    conditionGrade?: string
    benchNotes?: string
  } | null
  reportedCondition: {
    powersOn: boolean
    displayIntact: boolean
    visibleDamage: string[]
  }
  benchNotes: string
}

export interface AdminDashboardCategoryMetric {
  name: string
  units: number
  weightKg: number
  reuseRatePercent: number
  hazardUnits: number
}

export interface AdminDashboardOverview {
  totalProcessed: number
  totalWeightKg: number
  divertedKgTotal: number
  awaitingInspection: number
  scheduledRequestsCount: number
  listedReuse: number
  reuseConversionRatePercent: number
  disposalCount: number
  hazardAlertsActive: number
  categories: AdminDashboardCategoryMetric[]
}

export interface AdminReuseInventoryItem {
  id: string
  title: string
  description?: string
  category: string
  lockerBay: string
  hub?: string
  weightKg?: number
  status: 'Available' | 'Reserved' | 'Claimed'
  condition: string
  createdAt?: string
  claimId?: string
  pickupCode?: string
  reservedBy?: string
  reservedByEmail?: string
  reservedAt?: string
  expiresAt?: string | null
}

export interface AdminDisposalLogItem {
  id?: string
  manifestId: string
  itemName?: string
  category?: string
  decisionNotes?: string
  recycler: string
  itemsCount: number
  totalWeightKg: number
  status: string
  date: string
}

export function isNetworkError(err: unknown): boolean {
  if (!err) return false
  const msg = (err as any)?.message || String(err)
  const status = (err as any)?.status
  return (
    msg.includes('fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Network request failed') ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 404 ||
    !status
  )
}

export const FALLBACK_DASHBOARD_OVERVIEW: AdminDashboardOverview = {
  totalProcessed: 142,
  totalWeightKg: 864.5,
  divertedKgTotal: 612.8,
  awaitingInspection: 6,
  scheduledRequestsCount: 4,
  listedReuse: 38,
  reuseConversionRatePercent: 68.4,
  disposalCount: 24,
  hazardAlertsActive: 3,
  categories: [
    { name: 'Laptops & Computers', units: 48, weightKg: 288.0, reuseRatePercent: 78, hazardUnits: 2 },
    { name: 'Mobile Devices & Tablets', units: 36, weightKg: 108.0, reuseRatePercent: 82, hazardUnits: 4 },
    { name: 'Network & Servers', units: 22, weightKg: 198.5, reuseRatePercent: 54, hazardUnits: 1 },
    { name: 'Power Supplies & UPS', units: 18, weightKg: 144.0, reuseRatePercent: 32, hazardUnits: 5 },
    { name: 'Peripherals & Monitors', units: 14, weightKg: 96.0, reuseRatePercent: 71, hazardUnits: 0 },
    { name: 'Batteries & Accumulators', units: 4, weightKg: 30.0, reuseRatePercent: 0, hazardUnits: 4 },
  ],
}

export const FALLBACK_COLLECTION_REQUESTS: AdminCollectionRequest[] = [
  {
    id: 'req-101',
    requestCode: 'REQ-0101',
    residentName: 'Juan Dela Cruz',
    residentEmail: 'juan.delacruz@gmail.com',
    contactNumber: '+63 917 555 0192',
    siteName: 'Base 1 - Brgy. Hall Complex (Barangay Commonwealth)',
    address: 'Block 12 Lot 4, Commonwealth Avenue, Quezon City',
    preferredMethod: 'drop_off',
    status: 'pending_review',
    displayStatus: 'Pending Review',
    scheduledSlot: 'Today, 2:00 PM - 4:00 PM',
    requestedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    requestedDate: new Date().toISOString().slice(0, 10),
    relativeDate: '3 hours ago',
    linkedItemId: 'item-201',
    linkedItemStatus: 'collected',
  },
  {
    id: 'req-102',
    requestCode: 'REQ-0102',
    residentName: 'Maria Santos',
    residentEmail: 'maria.santos@yahoo.com',
    contactNumber: '+63 928 555 8312',
    siteName: 'Base 3 - Don Fabian (Barangay Commonwealth)',
    address: 'Phase 2, Don Fabian Village, Barangay Commonwealth',
    preferredMethod: 'drop_off',
    status: 'scheduled',
    displayStatus: 'Scheduled',
    scheduledSlot: 'Tomorrow, 10:00 AM - 12:00 PM',
    requestedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    requestedDate: new Date().toISOString().slice(0, 10),
    relativeDate: '8 hours ago',
    linkedItemId: 'item-202',
    linkedItemStatus: 'scheduled',
  },
  {
    id: 'req-103',
    requestCode: 'REQ-0103',
    residentName: 'Carlos Mendoza',
    residentEmail: 'carlos.mendoza@outlook.com',
    contactNumber: '+63 905 555 4910',
    siteName: 'Base 4 - Katuparan (Barangay Commonwealth)',
    address: 'Katuparan Street, Barangay Commonwealth',
    preferredMethod: 'drop_off',
    status: 'collected',
    displayStatus: 'Collected',
    scheduledSlot: 'Yesterday, 1:30 PM',
    requestedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    requestedDate: new Date(Date.now() - 3600000 * 24).toISOString().slice(0, 10),
    relativeDate: '1 day ago',
    linkedItemId: 'item-203',
    linkedItemStatus: 'pending_inspection',
  },
  {
    id: 'req-104',
    requestCode: 'REQ-0104',
    residentName: 'Ana Patricia Non',
    residentEmail: 'ana.non@community.ph',
    contactNumber: '+63 919 555 7721',
    siteName: 'Base 8 - Pilot Area (Barangay Commonwealth)',
    address: 'Pilot Area, Barangay Commonwealth, Quezon City',
    preferredMethod: 'drop_off',
    status: 'completed',
    displayStatus: 'Completed',
    scheduledSlot: 'Oct 14, 9:00 AM',
    requestedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    requestedDate: new Date(Date.now() - 3600000 * 72).toISOString().slice(0, 10),
    relativeDate: '3 days ago',
    linkedItemId: 'item-204',
    linkedItemStatus: 'available_for_reuse',
  },
]

export const FALLBACK_INSPECTION_QUEUE: AdminInspectionQueueItem[] = [
  {
    id: 'item-201',
    name: 'ThinkPad X1 Carbon Gen 8',
    serial: 'SN: TP-884210',
    specs: 'Intel Core i7-10510U, 16GB RAM, 512GB NVMe SSD',
    category: 'Laptops',
    status: 'pending_inspection',
    queueBucket: 'waiting',
    date: new Date().toISOString().slice(0, 10),
    relativeDate: 'Just now',
    risk: 'Low Risk',
    suggestion: 'Powers on. Keyboard intact. Ideal for Commonwealth Student Reuse Hub refurbishment.',
  },
  {
    id: 'item-202',
    name: 'MacBook Pro 15-inch (Mid 2018)',
    serial: 'SN: C02XG0PJJGH6',
    specs: '2.6GHz 6-core Intel Core i7, 16GB DDR4, Radeon Pro 555X',
    category: 'Laptops',
    status: 'pending_inspection',
    queueBucket: 'waiting',
    date: new Date().toISOString().slice(0, 10),
    relativeDate: '2 hours ago',
    risk: 'High Risk',
    suggestion: 'Chassis slight bulge observed at bottom cover. Battery health service warning.',
  },
  {
    id: 'item-203',
    name: 'Keychron K2 Mechanical Keyboard',
    serial: 'SN: KC-203914',
    specs: 'Gateron Brown Switches, RGB Backlight, Wireless/Wired',
    category: 'Peripherals',
    status: 'pending_inspection',
    queueBucket: 'waiting',
    date: new Date().toISOString().slice(0, 10),
    relativeDate: '5 hours ago',
    risk: 'Low Risk',
    suggestion: 'Minor keycap dust. All switches responsive. Pass to cleaning and catalog listing.',
  },
  {
    id: 'item-204',
    name: 'Dell UltraSharp U2719D 27" Monitor',
    serial: 'SN: CN-0F74G8-74445',
    specs: '2560x1440 IPS, HDMI/DP, USB 3.0 Hub',
    category: 'Monitors',
    status: 'available_for_reuse',
    queueBucket: 'inspected',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    relativeDate: 'Yesterday',
    risk: 'Low Risk',
    suggestion: 'Certified Grade A. No dead pixels. Dispatched to Area 1 Eco-Hub Locker Bay 04.',
  },
]

export const FALLBACK_INSPECTION_DETAILS: AdminInspectionDetails = {
  id: 'item-201',
  deviceModel: 'ThinkPad X1 Carbon Gen 8',
  serialNumber: 'SN: TP-884210',
  intakeDate: new Date().toISOString().slice(0, 10),
  resident: {
    name: 'Juan Dela Cruz',
    barangay: 'Barangay Commonwealth, Quezon City',
  },
  reportedCondition: {
    powersOn: true,
    displayIntact: true,
    visibleDamage: [],
  },
  benchNotes: 'Clean cosmetic condition. Battery cycles: 142. Ready for Barangay Commonwealth Student Reuse Hub.',
}

export const FALLBACK_REUSE_INVENTORY: AdminReuseInventoryItem[] = [
  {
    id: 'reuse-301',
    title: 'Dell UltraSharp U2719D 27" QHD Monitor',
    description: 'Crisp IPS display with minimal bezel, includes power and HDMI cables.',
    category: 'Monitors',
    lockerBay: 'Locker Bay 01',
    hub: 'Commonwealth Area 1 Eco-Hub',
    weightKg: 5.8,
    status: 'Available',
    condition: 'Grade A - Inspected & Certified',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
  },
  {
    id: 'reuse-302',
    title: 'Lenovo ThinkPad T480 14" Business Laptop',
    description: 'Intel i5-8350U, 16GB RAM, 256GB SSD, dual battery system.',
    category: 'Laptops',
    lockerBay: 'Locker Bay 02',
    hub: 'Commonwealth Area 1 Eco-Hub',
    weightKg: 1.65,
    status: 'Reserved',
    condition: 'Inspected & Working',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
  },
  {
    id: 'reuse-303',
    title: 'Keychron K2 Wireless Mechanical Keyboard',
    description: 'Tactile Gateron Brown switches, multi-device Bluetooth connectivity.',
    category: 'Peripherals',
    lockerBay: 'Locker Bay 03',
    hub: 'Commonwealth Area 1 Eco-Hub',
    weightKg: 0.85,
    status: 'Available',
    condition: 'Like New',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
  },
  {
    id: 'reuse-304',
    title: 'Apple iPad 8th Gen 32GB Wi-Fi (Space Gray)',
    description: 'Retina display, clean glass, battery health 91%. Ready for educational use.',
    category: 'Tablets',
    lockerBay: 'Locker Bay 04',
    hub: 'Commonwealth Area 1 Eco-Hub',
    weightKg: 0.49,
    status: 'Claimed',
    condition: 'Grade A - Working',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
  },
]

export const FALLBACK_DISPOSAL_LOGS: AdminDisposalLogItem[] = [
  {
    id: 'disp-401',
    manifestId: 'HAZ-0401',
    itemName: 'Swollen Li-Po Battery Pack (MacBook Pro 15")',
    category: 'Critical Hazard',
    decisionNotes: 'Battery degradation with severe swelling. Packaged in fire-resistant sand container for DENR-licensed hazardous recycler turnover.',
    recycler: 'Envirocycle Philippines Inc. (DENR Certified)',
    itemsCount: 1,
    totalWeightKg: 0.42,
    status: 'Tagged',
    date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
  },
  {
    id: 'disp-402',
    manifestId: 'HAZ-0402',
    itemName: 'Cracked CRT Television Tube & Flyback Unit',
    category: 'Hazardous',
    decisionNotes: 'Lead-leaching risk from fractured cathode glass. Dispatched to heavy metals recovery stream.',
    recycler: 'Cleanway Environmental Solutions Inc.',
    itemsCount: 1,
    totalWeightKg: 14.5,
    status: 'Dispatched',
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
  },
  {
    id: 'disp-403',
    manifestId: 'SAL-0403',
    itemName: 'Water Damaged Motherboards & Circuit Scrap',
    category: 'Precious Metals',
    decisionNotes: 'Severe copper/gold contact corrosion. Shredded and consolidated for smelter precious metal reclamation.',
    recycler: 'HMR Philippine Recyclers',
    itemsCount: 6,
    totalWeightKg: 4.8,
    status: 'Completed',
    date: new Date(Date.now() - 86400000 * 6).toISOString().slice(0, 10),
  },
]

export const adminApi = {
  getUsers: async () => {
    try {
      return await apiFetch<BackendUserRecord[]>('/admin/users')
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, returning empty users array for local merge:', err)
        return []
      }
      throw err
    }
  },

  createUser: async (payload: CreateAdminUserPayload) => {
    try {
      return await apiFetch<BackendUserRecord>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking createUser response for:', payload.email)
        return {
          id: `usr-mock-${Date.now()}`,
          email: payload.email,
          fullName: payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'New Official',
          firstName: payload.firstName,
          middleName: payload.middleName,
          lastName: payload.lastName,
          suffix: payload.suffix,
          phone: payload.phone || '+63 900 000 0000',
          idCode: payload.idCode || 'ECB-0000',
          role: (payload.role as BackendUserRole) || 'Official',
          department: payload.department || 'Commonwealth Area 1 Hub',
          status: (payload.status as any) || 'Active',
          twoFactorEnabled: payload.twoFactorEnabled ?? true,
          mustChangePassword: payload.mustChangePassword ?? true,
          notes: payload.notes || '',
          lastActive: 'Just now',
          createdAt: new Date().toISOString(),
        } as BackendUserRecord
      }
      throw err
    }
  },

  updateUser: async (id: string, payload: UpdateAdminUserPayload) => {
    try {
      return await apiFetch<BackendUserRecord>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking updateUser response for:', id)
        return {
          id,
          email: payload.email || 'updated@ecobyte.gov.ph',
          fullName: payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          ...payload,
        } as BackendUserRecord
      }
      throw err
    }
  },

  updateUserRole: async (id: string, role: BackendUserRole) => {
    try {
      return await apiFetch<BackendUserRecord>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking updateUserRole for:', id, role)
        return { id, role } as BackendUserRecord
      }
      throw err
    }
  },

  updateUserStatus: async (id: string, status: string) => {
    try {
      return await apiFetch<BackendUserRecord>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking updateUserStatus for:', id, status)
        return { id, status } as unknown as BackendUserRecord
      }
      throw err
    }
  },

  getDashboardOverview: async () => {
    try {
      return await apiFetch<AdminDashboardOverview>('/admin/dashboard/overview')
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, using fallback dashboard overview:', err)
        return FALLBACK_DASHBOARD_OVERVIEW
      }
      throw err
    }
  },

  getRequests: async () => {
    try {
      return await apiFetch<AdminCollectionRequest[]>('/admin/requests')
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, reading local collection requests:', err)
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('ecobyte_dropoff_requests')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((r: any) => ({
                  id: r.id,
                  requestCode: r.requestCode || r.id,
                  residentName: r.residentName || 'Resident User',
                  residentEmail: r.residentEmail,
                  contactNumber: '+63 917 000 0000',
                  siteName: r.siteName || 'Commonwealth Central MRF (Base 1)',
                  address: 'Commonwealth, Quezon City',
                  preferredMethod: r.itemName || r.type || 'drop_off',
                  status: (r.status || 'Scheduled').toLowerCase().replace(/\s+/g, '_'),
                  displayStatus: r.status || 'Scheduled',
                  scheduledSlot: r.slot || '10:00 AM – 12:00 PM',
                  requestedAt: new Date().toISOString(),
                  requestedDate: r.date || new Date().toISOString().slice(0, 10),
                  relativeDate: 'Today',
                  linkedItemId: `item-${r.id}`,
                  linkedItemStatus: (r.status || 'Scheduled').toLowerCase().replace(/\s+/g, '_'),
                }))
              }
            }
          } catch {}
        }
        return []
      }
      throw err
    }
  },

  updateRequestStatus: async (id: string, status: string) => {
    try {
      return await apiFetch<{ id: string; status: string; displayStatus: string }>(
        `/admin/requests/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }
      )
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking request status update for:', id)
        return { id, status, displayStatus: status.replace(/_/g, ' ') }
      }
      throw err
    }
  },

  startRequestInspection: async (
    id: string,
    payload?: { deviceName?: string; category?: string; estimatedWeightKg?: number }
  ) => {
    try {
      return await apiFetch<{ requestId: string; itemId: string; status: string }>(
        `/admin/requests/${id}/inspect`,
        {
          method: 'POST',
          body: JSON.stringify(payload ?? {}),
        }
      )
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking startRequestInspection for:', id)
        return { requestId: id, itemId: `item-from-${id}`, status: 'pending_inspection' }
      }
      throw err
    }
  },

  getInspectionQueue: async (scope: 'waiting' | 'inspected' | 'all' = 'waiting') => {
    try {
      return await apiFetch<AdminInspectionQueueItem[]>('/admin/inspections/queue', {
        params: { scope },
      })
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, inspection queue empty:', err)
        return []
      }
      throw err
    }
  },

  getInspectionDetails: async (id: string) => {
    try {
      return await apiFetch<AdminInspectionDetails>(`/admin/inspections/${id}`)
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, using fallback inspection details for:', id, err)
        return {
          ...FALLBACK_INSPECTION_DETAILS,
          id: id || FALLBACK_INSPECTION_DETAILS.id,
        }
      }
      throw err
    }
  },

  uploadInspectionPhoto: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('photo', file)
    return await apiFetch<{ url: string }>(`/admin/inspections/${id}/photos`, {
      method: 'POST',
      body: formData,
    })
  },

  submitInspectionVerdict: async (
    id: string,
    payload: {
      action: InspectionRoutingAction
      conditionGrade?: string
      benchNotes?: string
      inspectorAssessment?: InspectorAssessmentPayload
    }
  ) => {
    try {
      return await apiFetch<{
        success: boolean
        inspectionId: string
        itemId: string
        action: InspectionRoutingAction
        routedTo: string
        processedAt: string
      }>(`/admin/inspections/${id}/verdict`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, mocking inspection verdict submission for:', id)
        return {
          success: true,
          inspectionId: `insp-${Date.now()}`,
          itemId: id,
          action: payload.action,
          routedTo: payload.action,
          processedAt: new Date().toISOString(),
        }
      }
      throw err
    }
  },

  getReuseInventory: async () => {
    try {
      return await apiFetch<AdminReuseInventoryItem[]>('/admin/reuse/inventory')
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, using fallback reuse inventory:', err)
        return FALLBACK_REUSE_INVENTORY
      }
      throw err
    }
  },

  getDisposalLogs: async () => {
    try {
      return await apiFetch<AdminDisposalLogItem[]>('/admin/disposal/logs')
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        console.warn('Backend offline, using fallback disposal logs:', err)
        return FALLBACK_DISPOSAL_LOGS
      }
      throw err
    }
  },

  markDropoffReceived: async (id: string) => {
    return apiFetch<{
      success: boolean
      requestId: string
      itemId: string
      status: string
      displayStatus: string
      message: string
    }>(`/admin/requests/${id}/receive`, {
      method: 'POST',
    })
  },

  markDropoffMissed: async (id: string) => {
    return apiFetch<{
      success: boolean
      requestId: string
      status: string
      displayStatus: string
      message: string
    }>(`/admin/requests/${id}/missed`, {
      method: 'POST',
    })
  },

  verifyPickupCode: async (payload: {
    listingId?: string
    claimId?: string
    pickupCode: string
  }) => {
    return apiFetch<{
      success: boolean
      matched: boolean
      claimId?: string
      status?: string
      displayStatus?: string
      message?: string
      error?: string
    }>('/admin/transactions/verify-pickup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getTransactions: async (params?: {
    type?: 'all' | 'dropoff' | 'reuse'
    search?: string
  }) => {
    const qs = new URLSearchParams()
    if (params?.type && params.type !== 'all') qs.set('type', params.type)
    if (params?.search?.trim()) qs.set('search', params.search.trim())
    const queryStr = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch<AdminTransactionItem[]>(`/admin/transactions${queryStr}`)
  },

  getReportsData: async () => {
    return apiFetch<AdminReportsData>('/admin/reports')
  },

  getActivityLogs: async (params?: {
    userId?: string
    action?: string
    search?: string
  }) => {
    const qs = new URLSearchParams()
    if (params?.userId) qs.set('userId', params.userId)
    if (params?.action) qs.set('action', params.action)
    if (params?.search?.trim()) qs.set('search', params.search.trim())
    const queryStr = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch<AdminActivityLogItem[]>(`/admin/activity-logs${queryStr}`)
  },
}
