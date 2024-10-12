import { z } from 'zod'

const DATE_REGEX = /\d\d\d\d-\d\d-\d\d/
const TIME_REGEX = /\d+:\d\d:\d\d (AM|PM)/
const DAY_LENGTH_REGEX = /\d{1,2}:\d\d:\d\d/
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

const resultSchema = z
  .object({
    date: z.string().regex(DATE_REGEX),
    sunrise: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
    sunset: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
    first_light: z.null().or(z.string().regex(TIME_REGEX).transform(transformTimeEntry)),
    last_light: z.null().or(z.string().regex(TIME_REGEX).transform(transformTimeEntry)),
    dawn: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
    dusk: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
    solar_noon: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
    golden_hour: z.string().regex(TIME_REGEX).transform(transformTimeEntry),
    day_length: z.string().regex(DAY_LENGTH_REGEX).transform(parseDayLength),
    timezone: z.string().regex(TIMEZONE_REGEX),
    utc_offset: z.number().int(),
  })
  .transform(
    ({
      date,
      sunrise,
      sunset,
      first_light,
      last_light,
      dawn,
      dusk,
      solar_noon,
      golden_hour,
      day_length,
      timezone,
      utc_offset,
    }) => {
      const [fullYear, month, day] = date.split('-').map(Number)
      return {
        date,
        sunrise: new Date(sunrise.setFullYear(fullYear, month - 1, day)),
        sunset: new Date(sunset.setFullYear(fullYear, month - 1, day)),
        firstLight: first_light ? new Date(first_light.setFullYear(fullYear, month - 1, day)) : null,
        lastLight: last_light ? new Date(last_light.setFullYear(fullYear, month - 1, day)) : null,
        dawn: new Date(dawn.setFullYear(fullYear, month - 1, day)),
        dusk: new Date(dusk.setFullYear(fullYear, month - 1, day)),
        solarNoon: new Date(solar_noon.setFullYear(fullYear, month - 1, day)),
        goldenHour: new Date(golden_hour.setFullYear(fullYear, month - 1, day)),
        dayLength: day_length,
        timeZone: timezone,
        utcOffset: utc_offset,
      }
    },
  )

export const sunriseSunsetApiResponseSchema = z.object({
  status: z.string(),
  results: z.array(resultSchema),
})

export type LocationDataResponse = z.infer<typeof sunriseSunsetApiResponseSchema>['results']
