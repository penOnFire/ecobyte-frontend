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
  status?: string
  queueBucket?: 'waiting' | 'inspected'
  date: string
  relativeDate: string
  risk: 'High Risk' | 'Medium Risk' | 'Low Risk'
  suggestion: string
}

export interface AdminInspectionDetails {
  id: string
  deviceModel: string
  serialNumber: string
  intakeDate: string
  resident: {
    name: string
    barangay: string
  }
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
  getUsers: () => apiFetch<BackendUserRecord[]>('/admin/users'),

  createUser: (payload: CreateAdminUserPayload) =>
    apiFetch<BackendUserRecord>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateUser: (id: string, payload: UpdateAdminUserPayload) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateUserRole: (id: string, role: BackendUserRole) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  updateUserStatus: (id: string, status: string) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getDashboardOverview: () =>
    apiFetch<AdminDashboardOverview>('/admin/dashboard/overview'),

  getRequests: () => apiFetch<AdminCollectionRequest[]>('/admin/requests'),

  updateRequestStatus: (id: string, status: string) =>
    apiFetch<{ id: string; status: string; displayStatus: string }>(
      `/admin/requests/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  startRequestInspection: (
    id: string,
    payload?: { deviceName?: string; category?: string; estimatedWeightKg?: number }
  ) =>
    apiFetch<{ requestId: string; itemId: string; status: string }>(
      `/admin/requests/${id}/inspect`,
      {
        method: 'POST',
        body: JSON.stringify(payload ?? {}),
      }
    ),

  getInspectionQueue: (scope: 'waiting' | 'inspected' | 'all' = 'waiting') =>
    apiFetch<AdminInspectionQueueItem[]>('/admin/inspections/queue', {
      params: { scope },
    }),

  getInspectionDetails: (id: string) =>
    apiFetch<AdminInspectionDetails>(`/admin/inspections/${id}`),

  submitInspectionVerdict: (
    id: string,
    payload: { action: 'REUSE' | 'DISPOSAL'; conditionGrade?: string; benchNotes?: string }
  ) =>
    apiFetch<{
      success: boolean
      inspectionId: string
      itemId: string
      action: 'REUSE' | 'DISPOSAL'
      routedTo: string
      processedAt: string
    }>(`/admin/inspections/${id}/verdict`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getReuseInventory: () =>
    apiFetch<AdminReuseInventoryItem[]>('/admin/reuse/inventory'),

  getDisposalLogs: () => apiFetch<AdminDisposalLogItem[]>('/admin/disposal/logs'),
}
