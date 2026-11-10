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

  uploadProofOfClaim: async (reservationId: string, pickupCode: string, file: File) => {
    const formData = new FormData()
    formData.append('pickupCode', pickupCode)
    formData.append('photo', file)

    const token = localStorage.getItem('ecobyte_token')
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1'
    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/reuse/reservations/${reservationId}/proof-of-claim`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to upload proof of claim: ${response.statusText}`)
    }
    const json = await response.json()
    return json.data as { reservationId: string; status: string; divertedKg: number }
  },
}

