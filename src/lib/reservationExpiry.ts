export const RESERVATION_HOLD_MS = 48 * 60 * 60 * 1000

/** Computes the default 2-day (48-hour) reservation expiry Date from a base timestamp. */
export function computeTwoDayExpiryDate(fromMs = Date.now()): Date {
  return new Date(fromMs + RESERVATION_HOLD_MS)
}

/** Parses an ISO expiry timestamp, falling back to a 2-day offset when absent or invalid. */
export function parseExpiryDate(
  expiresIso: string | null | undefined,
  fallbackBaseMs: number
): Date {
  if (expiresIso) {
    const parsed = new Date(expiresIso)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }
  return computeTwoDayExpiryDate(fallbackBaseMs)
}

/** Formats a concise human-readable date and time for a reservation deadline. */
export function formatExpiryDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/** Formats remaining reservation hold countdown from `nowMs` until `expiryDate`. */
export function formatExpiryCountdown(
  expiryDate: Date,
  nowMs: number
): { isExpired: boolean; label: string } {
  const diffMs = expiryDate.getTime() - nowMs
  if (diffMs <= 0) {
    return { isExpired: true, label: 'Expired' }
  }

  const totalMinutes = Math.floor(diffMs / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const seconds = Math.floor((diffMs % 60_000) / 1000)

  if (days > 0) {
    return {
      isExpired: false,
      label: `${days}d ${hours}h left`,
    }
  }
  if (hours > 0) {
    return {
      isExpired: false,
      label: `${hours}h ${minutes}m left`,
    }
  }
  return {
    isExpired: false,
    label: `${minutes}m ${seconds}s left`,
  }
}
