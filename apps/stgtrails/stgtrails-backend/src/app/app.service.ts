import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { fetchWeatherApi } from 'openmeteo'

import { Prisma, PrismaService } from '@plusone/stgtrails-persistence'

import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { WeatherDataResponseDto } from './dto/weather-data-response.dto'
import { hourlyWeatherVariables, parseWeatherApiResponse } from './weather-api-utils'

import WeatherDataCreateManyInput = Prisma.WeatherDataCreateManyInput

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name)

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    await this.updateWeatherForecast()
  }

  public async getWeatherData(trailAreaId: number): Promise<Array<WeatherDataResponseDto>> {
    return this.prismaService.weatherData
      .findMany({
        select: {
          time: true,
          rain: true,
          temperature2m: true,
          soilMoisture0To1cm: true,
          soilMoisture1To3cm: true,
          soilMoisture3To9cm: true,
          soilMoisture9To27cm: true,
        },
        where: { trailAreaId },
        orderBy: {
          time: 'desc',
        },
        take: 96,
      })
      .then((data) => data.reverse())
  }

  public async createTrailArea(trailAreaCreateDto: TrailAreaCreateDto) {
    return this.prismaService.trailArea.create({ data: trailAreaCreateDto })
  }

  public async getTrailAreas(): Promise<Array<TrailAreaResponseDto>> {
    return this.prismaService.trailArea.findMany()
  }

  public async createTrail(trailAreaId: number, trail: TrailCreateDto) {
    return this.prismaService.trail.create({ data: { name: trail.name, trailAreaId } })
  }

  public async getTrailsOfArea(trailAreaId: number) {
    return this.prismaService.trail.findMany({ where: { trailAreaId } })
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  private async updateWeatherForecast() {
    const trailAreas = await this.prismaService.trailArea.findMany()
    this.logger.log(`Fetching weather data for ${trailAreas.length} trail areas.`)

    const sharedParams = {
      past_days: 3,
      forecast_days: 3,
      hourly: hourlyWeatherVariables,
      timezone: 'Europe/Berlin',
    }

    for (const trailArea of trailAreas) {
      const params = {
        ...sharedParams,
        latitude: trailArea.latitude,
        longitude: trailArea.longitude,
      }

      const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/forecast', params)
      const weatherData = parseWeatherApiResponse(responses[0])

      const transformedData: Array<WeatherDataCreateManyInput> = weatherData.time.reduce(
        (previousValue, currentValue, currentIndex) => {
          return [
            ...previousValue,
            {
              time: currentValue,
              temperature2m: weatherData.temperature2m[currentIndex],
              rain: weatherData.rain[currentIndex],
              soilMoisture0To1cm: weatherData.soilMoisture0To1cm[currentIndex],
              soilMoisture1To3cm: weatherData.soilMoisture1To3cm[currentIndex],
              soilMoisture3To9cm: weatherData.soilMoisture3To9cm[currentIndex],
              soilMoisture9To27cm: weatherData.soilMoisture9To27cm[currentIndex],
              // vapourPressureDeficit: weatherData.vapourPressureDeficit[currentIndex],
              // showers: weatherData.showers[currentIndex],
            },
          ]
        },
        [],
      )

      this.logger.log(`Adding ${transformedData.length} rows for trail area '${trailArea.name}'.`)

      await this.prismaService.$transaction(
        transformedData.map((weatherData) =>
          this.prismaService.weatherData.upsert({
            where: {
              trailAreaId_time: {
                trailAreaId: trailArea.id,
                time: weatherData.time,
              },
            },
            update: weatherData,
            create: { trailAreaId: trailArea.id, ...weatherData },
          }),
        ),
      )
    }
  }
}
