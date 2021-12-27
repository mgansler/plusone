import type { Weekday, WeekModifier } from './types'

// 1000 * 24 * 3600
export const A_DAY_IN_MS = 86_400_000

export const WeekdayMap: Record<Weekday, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
}

export const WeekModifierMap: Record<WeekModifier, number> = {
  'this-week': 0,
  'last-week': -7,
  'next-week': +7,
}
