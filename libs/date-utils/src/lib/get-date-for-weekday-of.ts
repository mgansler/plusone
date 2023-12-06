import { WeekdayMap, WeekModifierMap } from './constants'
import type { Weekday, WeekModifier } from './types'

export function getDateForWeekdayOf(weekday: Weekday, weekModifier: WeekModifier = 'this-week'): Date {
  const now = new Date()
  const dayOffset = WeekdayMap[weekday] - (now.getUTCDay() || 7)
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset + WeekModifierMap[weekModifier]),
  )
}
