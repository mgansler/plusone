import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { Prisma, PrismaService } from '@plusone/stgtrails-persistence'

import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { WeatherDataResponseDto } from './dto/weather-data-response.dto'
import { WeatherApiService } from './weather-api.service'

import WeatherDataCreateManyInput = Prisma.WeatherDataCreateManyInput

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly weatherApiService: WeatherApiService,
  ) {}

  async onModuleInit() {
    await this.updateWeatherForecast()
  }

  public async getWeatherData(
    trailAreaId: number,
    hours: number,
    utcOffsetHours: number,
  ): Promise<Array<WeatherDataResponseDto>> {
    return (
      this.prismaService.weatherData
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
          take: hours,
          // We fetch weather data for UTC but the client may want to retrieve data aligned to the local time zone.
          // Only works when we are east of utc (positive offset).
          skip: Math.max(0, utcOffsetHours),
          orderBy: {
            time: 'desc',
          },
        })
        // We take the last entries from the database and reverse the order so that the client receives the data in natural order.
        .then((data) => data.reverse())
    )
  }

  public async createTrailArea(trailAreaCreateDto: TrailAreaCreateDto) {
    return this.prismaService.trailArea.create({ data: trailAreaCreateDto })
  }

  public async getTrailAreas(): Promise<Array<TrailAreaResponseDto>> {
    return this.prismaService.trailArea.findMany()
  }

  public async updateTrailArea(trailAreaId: number, trail: TrailAreaUpdateDto) {
    return this.prismaService.trailArea.update({
      where: { id: trailAreaId },
      data: trail,
    })
  }

  public async createTrail(trailAreaId: number, trail: TrailCreateDto) {
    return this.prismaService.trail.create({ data: { name: trail.name, trailAreaId } })
  }

  public async getTrailsOfArea(trailAreaId: number) {
    return this.prismaService.trail.findMany({ where: { trailAreaId } })
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async updateWeatherForecast() {
    const trailAreas = await this.prismaService.trailArea.findMany()
    this.logger.log(`Updating weather data for ${trailAreas.length} trail areas.`)

    for (const trailArea of trailAreas) {
      const weatherData = await this.weatherApiService.fetchWeatherData({
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
            },
          ]
        },
        [],
      )

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
