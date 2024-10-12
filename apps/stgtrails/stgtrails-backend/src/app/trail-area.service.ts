import { Injectable } from '@nestjs/common'

import { PrismaService } from '@plusone/stgtrails-persistence'

import { AppService } from './app.service'
import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailUpdateDto } from './dto/trail-update.dto'

@Injectable()
export class TrailAreaService {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  public async createTrailArea(trailAreaCreateDto: TrailAreaCreateDto) {
    const trailArea = await this.prisma.trailArea.create({ data: trailAreaCreateDto })
    await this.appService.fetchDataForNewArea(trailArea)
    return trailArea
  }

  public async getTrailAreas(): Promise<Array<TrailAreaResponseDto>> {
    return this.prisma.trailArea.findMany()
  }

  public async updateTrailArea(trailAreaId: number, trail: TrailAreaUpdateDto) {
    const trailArea = await this.prisma.trailArea.update({
      where: { id: trailAreaId },
      data: trail,
    })
    await this.appService.fetchDataForNewArea(trailArea)
    return trailArea
  }

  public async deleteTrailArea(trailAreaId: number) {
    if ((await this.prisma.trail.count({ where: { trailAreaId } })) > 0) {
      throw new Error("Can't delete a trail area with attached trails.")
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.sunriseSunset.deleteMany({ where: { trailAreaId } })
      await tx.weatherData.deleteMany({ where: { trailAreaId } })
      return tx.trailArea.delete({ where: { id: trailAreaId } })
    })
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
}
