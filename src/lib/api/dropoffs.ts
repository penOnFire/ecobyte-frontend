import { apiFetch } from './client'
import type {
  DropOffSite,
  EwasteRequestItem,
  ScheduleBookingPayload,
} from '@/types'

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
}

