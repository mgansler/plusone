import { getDateFor } from './get-date-for'
import { WeekModifier } from './types'

export function getYearFor(weekModifier: WeekModifier, requestedDate: Date = new Date()) {
  return getDateFor(weekModifier, requestedDate).getUTCFullYear()
}
