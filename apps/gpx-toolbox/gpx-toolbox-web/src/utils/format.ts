/**
 * Format distance in meters to a human-readable string.
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

/**
 * Format elevation in meters to a human-readable string (rounded to integer).
 */
export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`
}

/**
 * Format duration in seconds to a human-readable string.
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

/** Signed difference to the reference, e.g. "+8.7 km" / "−160 m" */
export function formatDifference(value: number, reference: number, format: (v: number) => string): string {
  const diff = value - reference
  const formatted = format(Math.abs(diff))
  if (formatted === format(0)) return `±${formatted}`
  return `${diff > 0 ? '+' : '−'}${formatted}`
}
