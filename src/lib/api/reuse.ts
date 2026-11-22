import { apiFetch } from './client'
import type { ReservationBooking, ReuseItem } from '@/types'

export const reuseApi = {
  getItems: (params?: { category?: string; query?: string }) =>
    apiFetch<{
      totalVerified: number
      divertedKgThisWeek: number
      items: ReuseItem[]
    }>('/reuse/items', { params }),

  getItemById: (id: string) => apiFetch<ReuseItem>(`/reuse/items/${id}`),

  createReservation: (payload: {
    itemId: string
    pickupDate: string
    pickupTime: string
  }) =>
    apiFetch<ReservationBooking>('/reuse/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  uploadProofOfClaim: (reservationId: string, pickupCode: string, file: File) => {
    const formData = new FormData()
    formData.append('pickupCode', pickupCode)
    formData.append('photo', file)
    return apiFetch<{
      reservationId: string
      status: string
      divertedKg: number
      claimedAt?: string
      proofUrl?: string
    }>(
      `/reuse/reservations/${reservationId}/proof-of-claim`,
      {
        method: 'POST',
        body: formData,
      }
    )
  },

  cancelReservation: (reservationId: string) =>
    apiFetch<{ success: boolean; message: string }>(
      `/reuse/reservations/${reservationId}/cancel`,
      {
        method: 'POST',
      }
    ),
}

