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
  itemName?: string | null
  itemCategory?: string | null
  preferredMethod: string
  status: string
  displayStatus: string
  scheduledSlot: string
  requestedAt: string
  requestedDate: string
  relativeDate: string
  linkedItemId: string | null
  linkedItemStatus: string | null
  imageUrl?: string | null
  photos?: Array<{
    id: string
    angleLabel: string
    imageUrl: string
  }>
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
  imageUrl?: string | null
  photos?: Array<{
    id: string
    angleLabel: string
    imageUrl: string
  }>
}

export interface AdminTransactionItem {
  id: string
  rawId: string
  transactionNumber: string
  type: 'Drop-Off' | 'Reuse Pick-Up'
  itemName: string
  category: string
  condition?: string
  residentName: string
  residentEmail: string
  residentPhone?: string
  residentAddress?: string
  residentIdCode?: string
  validIdType?: string
  validIdNumber?: string
  residentBaseName?: string
  siteName: string
  dateSlot: string
  status: string
  displayStatus: string
  pickupCode?: string
  proofPhoto?: boolean
  proofUrl?: string | null
  resolvedAt?: string | null
  expiresAt?: string | null
  createdAt: string
}

export interface PickupClaimantIdentity {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  idCode: string
  validIdType: string
  validIdNumber: string
  baseName: string
}

export interface PickupLookupResponse {
  success: boolean
  matched: boolean
  claimId?: string
  transactionNumber?: string
  pickupCode?: string
  hasProofOfClaim?: boolean
  item?: {
    id: string
    title: string
    category: string
    condition: string
  }
  reservation?: {
    reservedAt: string | null
    expiresAt: string | null
    siteName: string
  }
  claimant?: PickupClaimantIdentity
  message?: string
  error?: string
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
    turnedOverUnits: number
    reuseUnits: number
    disposalUnits: number
    weightKg: number
    hazardUnits: number
    reuseRatePercent: number
  }>
  hazardRisk: {
    total: number
    low: { count: number; pct: number }
    medium: { count: number; pct: number }
    high: { count: number; pct: number }
  }
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
    baseName: string
    morning: number
    afternoon: number
    evening: number
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
    aiAnalysis?: {
      detectedModel?: string
      deviceCategory?: string
      wasteClassification?: string
      hazardLevel?: string
      hazardTitle?: string
      hazardInstructions?: string | null
      recommendedRoute?: string
      confidenceScore?: number
      summary?: string
      estimatedMassLabel?: string
      subsystems?: Array<{
        name: string
        status: string
        score: number
        details?: string
        description?: string
      }>
      analysisSource?: string
      aiModel?: string
    } | null
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
  imageUrl?: string | null
  images?: string[]
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

export const adminApi = {
  getUsers: async () => {
    return apiFetch<BackendUserRecord[]>('/admin/users')
  },

  createUser: async (payload: CreateAdminUserPayload) => {
    return apiFetch<BackendUserRecord>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateUser: async (id: string, payload: UpdateAdminUserPayload) => {
    return apiFetch<BackendUserRecord>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  updateUserRole: async (id: string, role: BackendUserRole) => {
    return apiFetch<BackendUserRecord>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },

  updateUserStatus: async (id: string, status: string) => {
    return apiFetch<BackendUserRecord>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  getDashboardOverview: async () => {
    return apiFetch<AdminDashboardOverview>('/admin/dashboard/overview')
  },

  getRequests: async () => {
    return apiFetch<AdminCollectionRequest[]>('/admin/requests')
  },

  updateRequestStatus: async (id: string, status: string) => {
    return apiFetch<{ id: string; status: string; displayStatus: string }>(
      `/admin/requests/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    )
  },

  startRequestInspection: async (
    id: string,
    payload?: { deviceName?: string; category?: string; estimatedWeightKg?: number }
  ) => {
    return apiFetch<{ requestId: string; itemId: string; status: string }>(
      `/admin/requests/${id}/inspect`,
      {
        method: 'POST',
        body: JSON.stringify(payload ?? {}),
      }
    )
  },

  getInspectionQueue: async (scope: 'waiting' | 'inspected' | 'all' = 'waiting') => {
    return apiFetch<AdminInspectionQueueItem[]>('/admin/inspections/queue', {
      params: { scope },
    })
  },

  getInspectionDetails: async (id: string) => {
    return apiFetch<AdminInspectionDetails>(`/admin/inspections/${id}`)
  },

  uploadInspectionPhoto: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('photo', file)
    return apiFetch<{ url: string }>(`/admin/inspections/${id}/photos`, {
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
    return apiFetch<{
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
  },

  getReuseInventory: async () => {
    return apiFetch<AdminReuseInventoryItem[]>('/admin/reuse/inventory')
  },

  getDisposalLogs: async () => {
    return apiFetch<AdminDisposalLogItem[]>('/admin/disposal/logs')
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

  lookupPickupCode: async (payload: {
    listingId?: string
    claimId?: string
    pickupCode: string
  }) => {
    return apiFetch<PickupLookupResponse>('/admin/transactions/lookup-pickup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  verifyPickupCode: async (payload: {
    listingId?: string
    claimId?: string
    pickupCode: string
    identityConfirmed?: boolean
  }) => {
    return apiFetch<{
      success: boolean
      matched: boolean
      claimId?: string
      status?: string
      displayStatus?: string
      collectedAt?: string
      claimant?: PickupClaimantIdentity
      message?: string
      error?: string
    }>('/admin/transactions/verify-pickup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  releaseClaim: async (claimId: string, reason?: string) => {
    return apiFetch<{
      success: boolean
      claimId: string
      status: string
      displayStatus: string
      message: string
    }>(`/admin/transactions/release-claim/${claimId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
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

  getReportsData: async (params?: { baseId?: string; days?: string }) => {
    const qs = new URLSearchParams()
    if (params?.baseId && params.baseId !== 'all') qs.set('baseId', params.baseId)
    if (params?.days) qs.set('days', params.days)
    const queryStr = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch<AdminReportsData>(`/admin/reports${queryStr}`)
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
