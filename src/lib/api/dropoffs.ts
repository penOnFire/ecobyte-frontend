import { apiFetch } from './client'
import type {
  DropOffSite,
  EwasteRequestItem,
  ScheduleBookingPayload,
} from '@/types'

export interface DashboardSummary {
  activeRequestsCount: number
  assessedCount: number
  reservedCount: number
  ecoPoints: number
  ecoTier: string
  divertedKg: number
  activeRequest: EwasteRequestItem | null
}

export const dropoffsApi = {
  getSites: (params?: { lat?: number; lng?: number; filter?: string }) =>
    apiFetch<DropOffSite[]>('/dropoffs/sites', { params }),

  scheduleIntake: (payload: ScheduleBookingPayload) =>
    apiFetch<{ requestId: string; status: string; scheduledTime: string }>(
      '/dropoffs/schedule',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  getMyRequests: () =>
    apiFetch<{
      ongoing: EwasteRequestItem[]
      completed: EwasteRequestItem[]
    }>('/requests/my-requests'),

  getDashboardSummary: () =>
    apiFetch<DashboardSummary>('/requests/dashboard-summary'),
}

