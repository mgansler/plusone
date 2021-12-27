import { WeekModifierMap } from './constants'
import type { WeekModifier } from './types'

export function getDateFor(weekModifier: WeekModifier, requestedDate: Date = new Date()): Date {
  const date = new Date(Date.UTC(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate()))
  date.setDate(date.getDate() + WeekModifierMap[weekModifier])
  return date
}
