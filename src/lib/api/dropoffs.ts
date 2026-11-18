import { apiFetch } from './client'
import type {
  DropOffSite,
  EwasteRequestItem,
  ResidentNotificationItem,
  ScheduleBookingPayload,
  UserReservationItem,
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

  rescheduleIntake: (requestId: string, payload: ScheduleBookingPayload) =>
    apiFetch<{ requestId: string; status: string; scheduledTime: string }>(
      `/dropoffs/schedule/${requestId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),

  cancelIntake: (requestId: string) =>
    apiFetch<{ requestId: string; status: string; message: string }>(
      `/dropoffs/schedule/${requestId}/cancel`,
      {
        method: 'PATCH',
      }
    ),

  getMyRequests: () =>
    apiFetch<{
      ongoing: EwasteRequestItem[]
      completed: EwasteRequestItem[]
      reservations?: UserReservationItem[]
    }>('/requests/my-requests'),

  getDashboardSummary: () =>
    apiFetch<DashboardSummary>('/requests/dashboard-summary'),

  getNotifications: () =>
    apiFetch<ResidentNotificationItem[]>('/requests/notifications'),

  markNotificationRead: (id: string) =>
    apiFetch<{ id: string; isRead: boolean }>(`/requests/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsRead: () =>
    apiFetch<{ success: boolean }>('/requests/notifications/read-all', {
      method: 'PATCH',
    }),
}

