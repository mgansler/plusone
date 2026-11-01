/** Min/max as typed into the inputs (empty string = no bound) */
export type NumberRange = { min: string; max: string }

export const emptyRange: NumberRange = { min: '', max: '' }

export function isEmptyRange(range: NumberRange): boolean {
  return range.min === '' && range.max === ''
}

/** Turn a typed range into query params, converting to meters with `factor` */
export function rangeParams<Min extends string, Max extends string>(
  range: NumberRange,
  minKey: Min,
  maxKey: Max,
  factor: number,
): Partial<Record<Min | Max, number>> {
  const params: Partial<Record<Min | Max, number>> = {}
  const min = parseFloat(range.min)
  const max = parseFloat(range.max)
  if (!isNaN(min)) params[minKey] = min * factor
  if (!isNaN(max)) params[maxKey] = max * factor
  return params
}

/** Strava `after`/`before` as ISO timestamps; "Bis" includes the whole selected day (local time) */
export function dateRangeParams({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }): Record<string, string> {
  const params: Record<string, string> = {}
  if (dateFrom) params.after = new Date(`${dateFrom}T00:00:00`).toISOString()
  if (dateTo) {
    const end = new Date(`${dateTo}T00:00:00`)
    end.setDate(end.getDate() + 1)
    params.before = end.toISOString()
  }
  return params
}

/** Indoor trainer rides: flagged as trainer, or virtual rides (Zwift etc.) which don't always set the flag */
export function isIndoorRide(activity: { trainer?: boolean; sport_type?: string }): boolean {
  return activity.trainer === true || activity.sport_type === 'VirtualRide'
}
