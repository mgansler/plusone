export const TIME_ZONE = 'Europe/Berlin'

export const SweepStatus = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
} as const
export type SweepStatus = (typeof SweepStatus)[keyof typeof SweepStatus]

export type SweepThresholds = {
  sweepGreenMaxDays: number
  sweepYellowMaxDays: number
}

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar days between both dates in the trail's time zone (today = 0, yesterday = 1, …) */
export function calendarDaysBetween(earlier: Date, later: Date): number {
  const toUtcDay = (date: Date) => {
    const [year, month, day] = dayFormat.format(date).split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toUtcDay(later) - toUtcDay(earlier)) / (24 * 60 * 60 * 1000))
}

/**
 * Traffic light for a trail based on its last sweep.
 * Kept as a pure function so seasonal thresholds can be plugged in later.
 */
export function computeSweepStatus(
  lastSweptAt: Date | null | undefined,
  thresholds: SweepThresholds,
  now: Date = new Date(),
): { status: SweepStatus; daysSinceSwept?: number } {
  if (!lastSweptAt) {
    return { status: SweepStatus.RED }
  }

  const daysSinceSwept = Math.max(0, calendarDaysBetween(lastSweptAt, now))
  if (daysSinceSwept <= thresholds.sweepGreenMaxDays) {
    return { status: SweepStatus.GREEN, daysSinceSwept }
  }
  if (daysSinceSwept <= thresholds.sweepYellowMaxDays) {
    return { status: SweepStatus.YELLOW, daysSinceSwept }
  }
  return { status: SweepStatus.RED, daysSinceSwept }
}
