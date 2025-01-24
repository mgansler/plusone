import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { WeatherApiService } from '@plusone/nestjs-services'
import { Prisma, PrismaService, TrailArea } from '@plusone/stgtrails-persistence'

import { WeatherDataResponseDto } from './dto/weather-data-response.dto'

import WeatherDataCreateManyInput = Prisma.WeatherDataCreateManyInput

@Injectable()
export class WeatherService {
  private logger = new Logger(WeatherService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherApi: WeatherApiService,
  ) {}

  public async getWeatherDataForTrailArea(
    trailAreaId: number,
    hours: number,
    utcOffsetHours: number,
  ): Promise<Array<WeatherDataResponseDto>> {
    return (
      this.prisma.weatherData
        .findMany({
          select: {
            time: true,
            rain: true,
            temperature2m: true,
            soilMoisture0To1cm: true,
            soilMoisture1To3cm: true,
            soilMoisture3To9cm: true,
            soilMoisture9To27cm: true,
            soilTemperature0cm: true,
            soilTemperature6cm: true,
            windGusts10m: true,
          },
          where: { trailAreaId },
          take: hours,
          // We fetch weather data for UTC but the client may want to retrieve data aligned to the local time zone.
          // Only works when we are east of utc (positive offset).
          skip: Math.max(0, utcOffsetHours),
          orderBy: {
            time: Prisma.SortOrder.desc,
          },
        })
        // We take the last entries from the database and reverse the order so that the client receives the data in natural order.
        .then((data) => data.reverse())
    )
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  public async updateWeatherForecast(trailAreas: Array<TrailArea> = []) {
    if (trailAreas.length === 0) {
      trailAreas = await this.prisma.trailArea.findMany()
    }
    this.logger.log(`Updating weather data for ${trailAreas.length} trail areas.`)

    for (const trailArea of trailAreas) {
      const weatherData = await this.weatherApi.fetchWeatherData({
        latitude: trailArea.latitude,
        longitude: trailArea.longitude,
      })

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
              soilTemperature0cm: weatherData.soilTemperature0cm[currentIndex],
              soilTemperature6cm: weatherData.soilTemperature6cm[currentIndex],
              windGusts10m: weatherData.windGusts10m[currentIndex],
            },
          ]
        },
        [],
      )

      await this.prisma.$transaction(
        transformedData.map((weatherData) =>
          this.prisma.weatherData.upsert({
            where: { trailAreaId_time: { trailAreaId: trailArea.id, time: weatherData.time } },
            update: weatherData,
            create: { trailAreaId: trailArea.id, ...weatherData },
          }),
        ),
      )
    }
  }
}
