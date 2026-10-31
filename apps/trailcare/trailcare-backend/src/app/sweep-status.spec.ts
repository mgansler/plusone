import { calendarDaysBetween, computeSweepStatus, SweepStatus } from './sweep-status'

const thresholds = { sweepGreenMaxDays: 2, sweepYellowMaxDays: 4 }

describe('calendarDaysBetween', () => {
  it('counts calendar days in Europe/Berlin, not 24h periods', () => {
    // 23:30 and 00:30 local time on consecutive days (CET = UTC+1)
    expect(calendarDaysBetween(new Date('2026-11-02T22:30:00Z'), new Date('2026-11-02T23:30:00Z'))).toBe(1)
    expect(calendarDaysBetween(new Date('2026-11-02T08:00:00Z'), new Date('2026-11-02T20:00:00Z'))).toBe(0)
  })

  it('handles daylight saving time changes', () => {
    expect(calendarDaysBetween(new Date('2026-10-24T10:00:00Z'), new Date('2026-10-26T10:00:00Z'))).toBe(2)
  })
})

describe('computeSweepStatus', () => {
  const now = new Date('2026-11-10T12:00:00Z')
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  it('is red when the trail was never swept', () => {
    expect(computeSweepStatus(null, thresholds, now)).toEqual({ status: SweepStatus.RED })
  })

  it.each([
    [0, SweepStatus.GREEN],
    [2, SweepStatus.GREEN],
    [3, SweepStatus.YELLOW],
    [4, SweepStatus.YELLOW],
    [5, SweepStatus.RED],
  ])('%i days ago is %s', (days, status) => {
    expect(computeSweepStatus(daysAgo(days), thresholds, now)).toEqual({ status, daysSinceSwept: days })
  })

  it('respects per trail thresholds', () => {
    expect(computeSweepStatus(daysAgo(1), { sweepGreenMaxDays: 0, sweepYellowMaxDays: 1 }, now).status).toBe(
      SweepStatus.YELLOW,
    )
  })

  it('treats entries slightly in the future as today', () => {
    expect(computeSweepStatus(new Date(now.getTime() + 60_000), thresholds, now)).toEqual({
      status: SweepStatus.GREEN,
      daysSinceSwept: 0,
    })
  })
})
