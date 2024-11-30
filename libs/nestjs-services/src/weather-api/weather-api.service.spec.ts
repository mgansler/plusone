import { WeatherApiService } from './weather-api.service'

describe('getHourlyWeatherVariables', () => {
  it('should return expected list of variables', () => {
    // @ts-expect-error private field
    expect(WeatherApiService.HOURLY_WEATHER_VARIABLES).toEqual([
      'temperature_2m',
      'rain',
      'soil_moisture_0_to_1cm',
      'soil_moisture_1_to_3cm',
      'soil_moisture_3_to_9cm',
      'soil_moisture_9_to_27cm',
      'soil_temperature_0cm',
      'soil_temperature_6cm',
    ])
  })
})
