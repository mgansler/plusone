import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

export function groupByDay(input?: Array<WeatherDataResponseDto>): Array<Array<WeatherDataResponseDto>> {
  if (!input) {
    return []
  }

  const result: Array<Array<WeatherDataResponseDto>> = []
  let currentDayGroup: Array<WeatherDataResponseDto> = []

  const getStartOfDay = (timestamp: number): number => {
    const date = new Date(timestamp)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }

  let currentDay: number | null = null

  for (const item of input) {
    const itemDay = getStartOfDay(new Date(item.time).valueOf())

    if (currentDay === null) {
      currentDay = itemDay
      currentDayGroup.push(item)
    } else if (itemDay === currentDay) {
      currentDayGroup.push(item)
    } else {
      result.push(currentDayGroup)
      currentDayGroup = [item]
      currentDay = itemDay
    }
  }

  if (currentDayGroup.length > 0) {
    result.push(currentDayGroup)
  }

  return result
}
