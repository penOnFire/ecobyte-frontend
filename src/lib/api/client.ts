import type { ApiResponse } from '@/types'

function resolveApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1'
  if (typeof window === 'undefined') return configured
  try {
    const parsed = new URL(configured, window.location.origin)
    const configuredIsLoopback =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
    const pageIsLoopback =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    // Remote visitors (e.g. ngrok / LAN / devtunnel) must route through the Vite proxy (/api/v1)
    // instead of calling localhost on their own machine.
    if (configuredIsLoopback && !pageIsLoopback) {
      return '/api/v1'
    }
  } catch {
    return configured
  }
  return configured
}

const BASE_URL = resolveApiBaseUrl()

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
    try {
      const origin = new URL(BASE_URL).origin
      return `${origin}${url.startsWith('/') ? url : `/${url}`}`
    } catch {
      return url
    }
  }
  return url
}

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
  const isFormData = typeof FormData !== 'undefined' && customConfig.body instanceof FormData

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  }

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json'
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

export async function openAuthenticatedMedia(endpoint: string): Promise<void> {
  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('ecobyte_token') : null
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new ApiErrorResponse(
      response.status,
      'MEDIA_FETCH_ERROR',
      `Unable to open attachment (HTTP ${response.status}).`
    )
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  window.open(objectUrl, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}
