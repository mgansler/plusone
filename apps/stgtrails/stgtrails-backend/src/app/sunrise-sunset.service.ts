import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { SunriseSunsetApiService } from '@plusone/nestjs-services'
import { Prisma, PrismaService, TrailArea } from '@plusone/stgtrails-persistence'

@Injectable()
export class SunriseSunsetService {
  private readonly logger = new Logger(SunriseSunsetService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly sunriseSunsetApi: SunriseSunsetApiService,
  ) {}

  public async getSunriseSunsetForTrailArea(trailAreaId: number, days: number) {
    return this.prisma.sunriseSunset.findMany({
      select: { date: true, sunrise: true, sunset: true },
      where: { trailAreaId },
      take: days + 1, // timezones are weird, make sure to create an overlap
      orderBy: {
        date: Prisma.SortOrder.desc,
      },
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  public async updateSunriseSunsetData(trailAreas: Array<TrailArea> = []) {
    if (trailAreas.length === 0) {
      trailAreas = await this.prisma.trailArea.findMany()
    }
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
