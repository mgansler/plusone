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

/** Compact distance for lists and badges: one decimal in km, e.g. "12.3 km" */
export function formatDistanceShort(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

/** Elevation gain in "Höhenmeter", e.g. "350 hm" */
export function formatElevationGain(meters: number): string {
  return `${Math.round(meters)} hm`
}

/** Compact duration without seconds, e.g. "1h 5m"; "–" for an unknown (0) duration */
export function formatDurationShort(seconds: number): string {
  if (!seconds) return '–'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
