import type { Weekday, WeekModifier } from './types'
import { WeekdayMap, WeekModifierMap } from './constants'

export function getDateForWeekdayOf(weekday: Weekday, weekModifier: WeekModifier = 'this-week'): Date {
  const now = new Date()
  const dayOffset = WeekdayMap[weekday] - (now.getUTCDay() || 7)
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset + WeekModifierMap[weekModifier]),
  )
}
