import { z } from 'zod'

const DATE_REGEX = /\d\d\d\d-\d\d-\d\d/
const TIME_REGEX = /\d+:\d\d:\d\d (AM|PM)/
const DAY_LENGTH_REGEX = /\d\d:\d\d:\d\d/
const TIMEZONE_REGEX = /\w\/\w/

function transformTimeEntry(value: string): Date {
  const [time, AM_PM] = value.split(' ')
  const [hours, minutes, seconds] = time.split(':').map(Number)

  const normalizedHours = hours + (AM_PM === 'PM' ? 12 : 0)

  const date = new Date()
  date.setHours(normalizedHours, minutes, seconds, 0)

  return date
}

function parseDayLength(value: string): number {
  const [hours, minutes, seconds] = value.split(':').map(Number)

  return hours * 3600 + minutes * 60 + seconds
}

export const locationDataResponseSchema = z.object({
  status: z.string(),
  results: z
    .object({
      date: z.string().regex(DATE_REGEX),
      sunrise: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
      sunset: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
      first_light: z.null(),
      last_light: z.null(),
      dawn: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
      dusk: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
      solar_noon: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
      golden_hour: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
      day_length: z.string().regex(DAY_LENGTH_REGEX).transform(parseDayLength),
      timezone: z.string().regex(TIMEZONE_REGEX),
      utc_offset: z.number().int(),
    })
    .transform(({ first_light, last_light, solar_noon, golden_hour, day_length, timezone, utc_offset, ...rest }) => ({
      ...rest,
      firstLight: first_light,
      lastLight: last_light,
      solarNoon: solar_noon,
      goldenHour: golden_hour,
      dayLength: day_length,
      timeZone: timezone,
      utcOffset: utc_offset,
    })),
})
