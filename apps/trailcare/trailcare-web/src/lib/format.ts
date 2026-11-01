export const TIME_ZONE = 'Europe/Berlin'

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

/** `YYYY-MM-DD` in the trail's time zone, as used by `<input type="date">` */
export function toDayKey(date: Date): string {
  return dayKeyFormat.format(date)
}

/** Value for `performedAt`: undefined (= now) for today, noon of the chosen day otherwise */
export function performedAtForDay(dayKey: string, today = toDayKey(new Date())): string | undefined {
  if (dayKey === today) {
    return undefined
  }
  return new Date(`${dayKey}T12:00:00`).toISOString()
}

export function sweptLabel(daysSinceSwept: number | undefined): string {
  if (daysSinceSwept === undefined) return 'Noch nie gefegt'
  if (daysSinceSwept === 0) return 'Heute gefegt'
  if (daysSinceSwept === 1) return 'Gestern gefegt'
  return `Vor ${daysSinceSwept} Tagen gefegt`
}

export function relativeDay(iso: string, now = new Date()): string {
  const days = Math.round((Date.parse(toDayKey(now)) - Date.parse(toDayKey(new Date(iso)))) / (24 * 60 * 60 * 1000))
  if (days <= 0) return 'heute'
  if (days === 1) return 'gestern'
  if (days < 7) return `vor ${days} Tagen`
  return formatDate(iso)
}

export function trailCount(count: number): string {
  if (count === 0) {
    return 'keine Trails'
  }
  return count === 1 ? '1 Trail' : `${count} Trails`
}
