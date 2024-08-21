import { hourlyWeatherVariables } from './weather-api-utils'

describe('getHourlyWeatherVariables', () => {
  it('should return expected list of variables', () => {
    expect(hourlyWeatherVariables).toEqual([
      'temperature_2m',
      'rain',
      'soil_moisture_0_to_1cm',
      'soil_moisture_1_to_3cm',
      'soil_moisture_3_to_9cm',
      'soil_moisture_9_to_27cm',
    ])
  })
})
