import { apiFetch } from './client'
import type {
  AngleUploadResult,
  CameraAngle,
  DamageAssessmentPayload,
  DiagnosticResult,
} from '@/types'

export const assessmentsApi = {
  uploadAngle: async (sessionId: string, angle: CameraAngle, file: File) => {
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('angle', angle)
    formData.append('image', file)

    const token = localStorage.getItem('ecobyte_token')
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1'
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/assessments/scan-angles`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload angle: ${response.statusText}`)
    }
    const json = await response.json()
    return json.data as AngleUploadResult
  },

  submitDetails: (payload: DamageAssessmentPayload) =>
    apiFetch<DiagnosticResult>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDiagnostic: (assessmentId: string) =>
    apiFetch<DiagnosticResult>(`/assessments/${assessmentId}/diagnostic`),
}

