import { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response'

const weatherVariables = {
  temperature2m: 'temperature_2m',
  rain: 'rain',
  soilMoisture0To1cm: 'soil_moisture_0_to_1cm',
  soilMoisture1To3cm: 'soil_moisture_1_to_3cm',
  soilMoisture3To9cm: 'soil_moisture_3_to_9cm',
  soilMoisture9To27cm: 'soil_moisture_9_to_27cm',
}

export const hourlyWeatherVariables = Object.values(weatherVariables)

export function parseWeatherApiResponse(response: WeatherApiResponse) {
  const utcOffsetSeconds = response.utcOffsetSeconds()
  const hourly = response.hourly()
  if (hourly === null) {
    throw new Error('No hourly data available.')
  }

  return {
    time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
      (t) => new Date((t + utcOffsetSeconds) * 1_000),
    ),
    ...Object.keys(weatherVariables).reduce(
      (previousValue, currentValue: keyof typeof weatherVariables, currentIndex) => {
        return {
          ...previousValue,
          [currentValue]: hourly.variables(currentIndex).valuesArray(),
        }
      },
      {} as Record<keyof typeof weatherVariables, Float32Array>,
    ),
  }
}

function range(start: number, stop: number, step: number) {
  return Array.from({ length: (stop - start) / step }, (_, i) => start + i * step)
}
