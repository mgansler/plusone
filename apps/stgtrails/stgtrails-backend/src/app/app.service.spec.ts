import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'

import { SunriseSunsetApiService } from '@plusone/nestjs-services/sunrise-sunset-api'
import { WeatherApiService } from '@plusone/nestjs-services/weather-api'
import { PrismaService } from '@plusone/stgtrails-persistence'

import { AppService } from './app.service'

describe('AppService', () => {
  let appService: AppService
  let prismaService: PrismaService
  let weatherApiService: WeatherApiService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            trailArea: {
              findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'TrailAreaOne', latitude: 1, longitude: 2 }]),
            },
            weatherData: {
              upsert: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: new HttpService(),
        },
        SunriseSunsetApiService,
        {
          provide: WeatherApiService,
          useValue: {
            fetchWeatherData: jest.fn().mockResolvedValue({
              time: [new Date(1_000), new Date(2_000), new Date(3_000)],
              temperature2m: [10, 11, 12],
              rain: [0, 1, 2],
              soilMoisture0To1cm: [0.2, 0.25, 0.3],
              soilMoisture1To3cm: [0.3, 0.35, 0.4],
              soilMoisture3To9cm: [0.4, 0.45, 0.5],
              soilMoisture9To27cm: [0.5, 0.55, 0.6],
            }),
          },
        },
      ],
    }).compile()

    appService = moduleRef.get<AppService>(AppService)
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    weatherApiService = moduleRef.get<WeatherApiService>(WeatherApiService)
  })

  describe('updateWeatherForecast', () => {
    it('should update weather data', async () => {
      // @ts-expect-error private method
      await appService.updateWeatherForecast()

      expect(weatherApiService.fetchWeatherData).toHaveBeenCalledWith({ latitude: 1, longitude: 2 })
      expect(prismaService.weatherData.upsert).toHaveBeenCalledTimes(3)
    })
  })
})
