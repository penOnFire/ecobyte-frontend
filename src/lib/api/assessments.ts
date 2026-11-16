import { apiFetch } from './client'
import type {
  AngleUploadResult,
  CameraAngle,
  DamageAssessmentPayload,
  DiagnosticResult,
} from '@/types'

export const assessmentsApi = {
  uploadAngle: (sessionId: string, angle: CameraAngle, file: File) => {
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('angle', angle)
    formData.append('image', file)
    return apiFetch<AngleUploadResult>('/assessments/scan-angles', {
      method: 'POST',
      body: formData,
    })
  },

  submitDetails: (payload: DamageAssessmentPayload) =>
    apiFetch<DiagnosticResult>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDiagnostic: (assessmentId: string) =>
    apiFetch<DiagnosticResult>(`/assessments/${assessmentId}/diagnostic`),
}

