import { getDateFor } from './get-date-for'
import type { WeekModifier } from './types'

export function getYearFor(weekModifier: WeekModifier, requestedDate: Date = new Date()): number {
  return getDateFor(weekModifier, requestedDate).getUTCFullYear()
}
