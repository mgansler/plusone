import { WeekModifier } from '@plusone/date-utils'

// 1000 * 24 * 3600
export const A_DAY_IN_MS = 86_400_000

export const WeekModifierMap: Record<WeekModifier, number> = {
  today: 0,
  'last-week': -7,
  'next-week': +7,
}
