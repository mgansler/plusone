import { fetchWeatherApi } from 'openmeteo'

describe('weather', () => {
  // eslint-disable-next-line no-restricted-properties
  it('should make a call', async () => {
    const params = {
      latitude: 48.75,
      longitude: 9.13,
      start_date: '2024-07-01',
      end_date: '2024-07-08',
      hourly: ['temperature_2m', 'rain', 'soil_moisture_0_to_7cm'],
      timezone: 'Europe/Berlin',
    }
    const url = 'https://archive-api.open-meteo.com/v1/archive'
    const responses = await fetchWeatherApi(url, params)
    const response = responses[0]

    const utcOffsetSeconds = response.utcOffsetSeconds()
    const hourly = response.hourly()!
    const weatherData = {
      hourly: {
        time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
          (t) => new Date((t + utcOffsetSeconds) * 1000),
        ),
        temperature2m: hourly.variables(0)!.valuesArray()!,
        rain: hourly.variables(1)!.valuesArray()!,
        soilMoisture0To7cm: hourly.variables(2)!.valuesArray()!,
      },
    }

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    console.table(weatherData.hourly)
  })
})

const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step)
