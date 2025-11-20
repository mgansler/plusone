import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'

import { WeatherApiService } from './weather-api.service'

describe('getHourlyWeatherVariables', () => {
  it('should return expected list of variables', () => {
    // @ts-expect-error private field
    expect(WeatherApiService.HOURLY_WEATHER_VARIABLES).toEqual([
      'temperature_2m',
      'rain',
      'snowfall',
      'snow_depth',
      'soil_moisture_0_to_1cm',
      'soil_moisture_1_to_3cm',
      'soil_moisture_3_to_9cm',
      'soil_moisture_9_to_27cm',
      'soil_temperature_0cm',
      'soil_temperature_6cm',
      'wind_gusts_10m',
    ])
  })
})

describe('getDailyWeatherVariables', () => {
  let weatherApiService: WeatherApiService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: new HttpService(),
        },
        WeatherApiService,
      ],
    }).compile()

    weatherApiService = moduleRef.get<WeatherApiService, WeatherApiService>(WeatherApiService)
  })

  it('should return the height for coordinates', async () => {
    const actual = await weatherApiService.getHeightForCoordinates({ latitude: 48.7742045, longitude: 9.1595041 })
    expect(actual).toEqual(285)
  })
})
