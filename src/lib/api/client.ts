import type { ApiResponse } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export class ApiErrorResponse extends Error {
  status: number
  code: string
  details?: unknown[]

  constructor(status: number, code: string, message: string, details?: unknown[]) {
    super(message)
    this.name = 'ApiErrorResponse'
    this.status = status
    this.code = code
    this.details = details
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options

  let url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) searchParams.append(key, String(val))
    })
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('ecobyte_token') : null

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorCode = 'HTTP_ERROR'
    let errorMessage = `Request failed with status ${response.status}`
    let errorDetails: unknown[] | undefined

    try {
      const errJson = await response.json()
      if (errJson?.error) {
        errorCode = errJson.error.code || errorCode
        errorMessage = errJson.error.message || errorMessage
        errorDetails = errJson.error.details
      }
    } catch {
      // JSON parse failed, retain generic message
    }

    throw new ApiErrorResponse(response.status, errorCode, errorMessage, errorDetails)
  }

  const result = (await response.json()) as ApiResponse<T>
  return result.data
}
