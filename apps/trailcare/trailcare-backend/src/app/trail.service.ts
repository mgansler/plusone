import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { CareType, Prisma, PrismaService } from '@plusone/trailcare-persistence'

import { ActiveSession } from './auth/session.service'
import { toCareEntryDto } from './care-entry.mapper'
import { CreateTrailDto, TrailAreaDto, TrailAreaInputDto, TrailDto, UpdateTrailDto } from './dto/trail.dto'
import { rethrowPrismaError } from './prisma-errors'
import { computeSweepStatus } from './sweep-status'

const trailInclude = {
  trailArea: { select: { name: true } },
  aliases: { orderBy: { name: 'asc' } },
  careEntries: { orderBy: [{ performedAt: 'desc' }, { id: 'desc' }], take: 1 },
} satisfies Prisma.TrailInclude

type TrailWithRelations = Prisma.TrailGetPayload<{ include: typeof trailInclude }>

@Injectable()
export class TrailService {
  constructor(private readonly prisma: PrismaService) {}

  async listTrailAreas(session?: ActiveSession): Promise<Array<TrailAreaDto>> {
    const [areas, lastSweeps] = await Promise.all([
      this.prisma.trailArea.findMany({
        orderBy: { name: 'asc' },
        include: { trails: { orderBy: { name: 'asc' }, include: trailInclude } },
      }),
      this.lastSweptAtByTrail(),
    ])

    return areas.map((area) => ({
      id: area.id,
      name: area.name,
      trails: area.trails.map((trail) => toTrailDto(trail, lastSweeps.get(trail.id), session)),
    }))
  }

  async getTrail(trailId: number, session?: ActiveSession): Promise<TrailDto> {
    const trail = await this.prisma.trail.findUnique({ where: { id: trailId }, include: trailInclude })
    if (!trail) {
      throw new NotFoundException()
    }
    const lastSweeps = await this.lastSweptAtByTrail(trailId)
    return toTrailDto(trail, lastSweeps.get(trailId), session)
  }

  async createTrailArea(input: TrailAreaInputDto) {
    return this.prisma.trailArea
      .create({ data: { name: input.name } })
      .catch((error) => rethrowPrismaError(error, 'Ein Trailgebiet mit diesem Namen existiert bereits'))
  }

  async updateTrailArea(trailAreaId: number, input: TrailAreaInputDto) {
    return this.prisma.trailArea
      .update({ where: { id: trailAreaId }, data: { name: input.name } })
      .catch((error) => rethrowPrismaError(error, 'Ein Trailgebiet mit diesem Namen existiert bereits'))
  }

  async deleteTrailArea(trailAreaId: number) {
    await this.prisma.trailArea.delete({ where: { id: trailAreaId } }).catch((error) => rethrowPrismaError(error, ''))
  }

  async createTrail(trailAreaId: number, input: CreateTrailDto): Promise<TrailDto> {
    validateThresholds(input.sweepGreenMaxDays ?? 2, input.sweepYellowMaxDays ?? 4)

    const trail = await this.prisma.trail
      .create({
        data: {
          name: input.name,
          trailAreaId,
          sweepGreenMaxDays: input.sweepGreenMaxDays,
          sweepYellowMaxDays: input.sweepYellowMaxDays,
          aliases: { create: uniqueAliases(input.aliases, input.name).map((name) => ({ name })) },
        },
        include: trailInclude,
      })
      .catch((error) => rethrowPrismaError(error, 'Ein Trail mit diesem Namen existiert in diesem Gebiet bereits'))

    return toTrailDto(trail, undefined)
  }

  async updateTrail(trailId: number, input: UpdateTrailDto): Promise<TrailDto> {
    const existing = await this.prisma.trail.findUnique({ where: { id: trailId } })
    if (!existing) {
      throw new NotFoundException()
    }
    validateThresholds(
      input.sweepGreenMaxDays ?? existing.sweepGreenMaxDays,
      input.sweepYellowMaxDays ?? existing.sweepYellowMaxDays,
    )

    await this.prisma.trail
      .update({
        where: { id: trailId },
        data: {
          name: input.name,
          trailAreaId: input.trailAreaId,
          sweepGreenMaxDays: input.sweepGreenMaxDays,
          sweepYellowMaxDays: input.sweepYellowMaxDays,
          aliases: input.aliases && {
            deleteMany: {},
            create: uniqueAliases(input.aliases, input.name ?? existing.name).map((name) => ({ name })),
          },
        },
      })
      .catch((error) => rethrowPrismaError(error, 'Ein Trail mit diesem Namen existiert in diesem Gebiet bereits'))

    return this.getTrail(trailId)
  }

  async deleteTrail(trailId: number) {
    await this.prisma.trail.delete({ where: { id: trailId } }).catch((error) => rethrowPrismaError(error, ''))
  }

  private async lastSweptAtByTrail(trailId?: number): Promise<Map<number, Date>> {
    const sweeps = await this.prisma.careEntry.groupBy({
      by: ['trailId'],
      where: { type: CareType.SWEPT, trailId },
      _max: { performedAt: true },
    })
    return new Map(
      sweeps.flatMap((sweep) => (sweep._max.performedAt ? [[sweep.trailId, sweep._max.performedAt] as const] : [])),
    )
  }
}

function toTrailDto(trail: TrailWithRelations, lastSweptAt: Date | undefined, session?: ActiveSession): TrailDto {
  const { status, daysSinceSwept } = computeSweepStatus(lastSweptAt, trail)
  const lastCareEntry = trail.careEntries[0]

  return {
    id: trail.id,
    name: trail.name,
    trailAreaId: trail.trailAreaId,
    trailAreaName: trail.trailArea.name,
    aliases: trail.aliases.map((alias) => alias.name),
    sweepGreenMaxDays: trail.sweepGreenMaxDays,
    sweepYellowMaxDays: trail.sweepYellowMaxDays,
    sweepStatus: status,
    lastSweptAt,
    daysSinceSwept,
    lastCareEntry: lastCareEntry && toCareEntryDto(lastCareEntry, session),
  }
}

function validateThresholds(green: number, yellow: number) {
  if (yellow < green) {
    throw new BadRequestException('Der Schwellwert für Gelb muss mindestens so groß sein wie der für Grün')
  }
}

/** Drop duplicates and aliases that equal the trail name (case insensitive) */
function uniqueAliases(aliases: Array<string> | undefined, trailName: string): Array<string> {
  const seen = new Set([trailName.toLocaleLowerCase('de')])
  return (aliases ?? []).filter((alias) => {
    const key = alias.toLocaleLowerCase('de')
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
