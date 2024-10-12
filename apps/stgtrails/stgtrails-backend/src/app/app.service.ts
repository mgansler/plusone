import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { SunriseSunsetApiService } from '@plusone/nestjs-services/sunrise-sunset-api'
import { WeatherApiService } from '@plusone/nestjs-services/weather-api'
import { Prisma, PrismaService } from '@plusone/stgtrails-persistence'

import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailUpdateDto } from './dto/trail-update.dto'
import { WeatherDataResponseDto } from './dto/weather-data-response.dto'

import WeatherDataCreateManyInput = Prisma.WeatherDataCreateManyInput

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly sunriseSunsetApi: SunriseSunsetApiService,
    private readonly weatherApi: WeatherApiService,
  ) {}

  async onModuleInit() {
    // We call this on init to have data immediately available after new deployment
    await this.updateWeatherForecast()
    await this.updateSunriseSunsetData()
  }

  public async createTrailArea(trailAreaCreateDto: TrailAreaCreateDto) {
    return this.prisma.trailArea.create({ data: trailAreaCreateDto })
  }

  public async getTrailAreas(): Promise<Array<TrailAreaResponseDto>> {
    return this.prisma.trailArea.findMany()
  }

  public async updateTrailArea(trailAreaId: number, trail: TrailAreaUpdateDto) {
    return this.prisma.trailArea.update({
      where: { id: trailAreaId },
      data: trail,
    })
  }

  public async deleteTrailArea(trailAreaId: number) {
    if ((await this.prisma.trail.count({ where: { trailAreaId } })) > 0) {
      throw new Error("Can't delete a trail area with attached trails.")
    }

    return this.prisma.trailArea.delete({ where: { id: trailAreaId } })
  }

  public async createTrail(trailAreaId: number, trail: TrailCreateDto) {
    return this.prisma.trail.create({ data: { name: trail.name, trailAreaId } })
  }

  public async getTrailsOfArea(trailAreaId: number) {
    return this.prisma.trail.findMany({ where: { trailAreaId } })
  }

  public async updateTrail(trailId: number, trail: TrailUpdateDto) {
    return this.prisma.trail.update({ where: { id: trailId }, data: trail })
  }

  public async deleteTrail(trailId: number) {
    return this.prisma.trail.delete({ where: { id: trailId } })
  }

  public async getSunriseSunsetOfArea(trailAreaId: number, days: number) {
    return this.prisma.sunriseSunset.findMany({
      select: { date: true, sunrise: true, sunset: true },
      where: { trailAreaId },
      take: days + 1, // timezones are weird, make sure to create an overlap
      orderBy: {
        date: 'desc',
      },
    })
  }

  public async getWeatherData(
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

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async updateWeatherForecast() {
    const trailAreas = await this.prisma.trailArea.findMany()
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

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  private async updateSunriseSunsetData() {
    const trailAreas = await this.prisma.trailArea.findMany()
    this.logger.log(`Updating sunrise and sunset data for ${trailAreas.length} trail areas.`)

    const today = new Date()
    for (const trailArea of trailAreas) {
      const MS_PER_DAY = 24 * 60 * 60 * 1000 // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
      const locationDataList = await this.sunriseSunsetApi.getLocationData({
        longitude: trailArea.longitude,
        latitude: trailArea.latitude,
        dateStart: new Date(today.getTime() - 7 * MS_PER_DAY),
        dateEnd: new Date(today.getTime() + 3 * MS_PER_DAY),
      })

      await this.prisma.$transaction(
        locationDataList.map(({ date, sunrise, sunset }) =>
          this.prisma.sunriseSunset.upsert({
            where: { trailAreaId_date: { trailAreaId: trailArea.id, date } },
            update: { sunrise, sunset },
            create: { trailAreaId: trailArea.id, date, sunrise, sunset },
          }),
        ),
      )
    }
  }
}
