import { A_DAY_IN_MS } from './constants'

/*
 * returns the week number according to ISO 8601
 * https://en.wikipedia.org/wiki/ISO_8601
 */
export function getWeekOfYearFor(requestedDate: Date = new Date()): number {
  const date = new Date(Date.UTC(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate()))
  date.setUTCDate(4 + date.getUTCDate() - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((Number(date) - Number(yearStart)) / A_DAY_IN_MS + 1) / 7)
}
