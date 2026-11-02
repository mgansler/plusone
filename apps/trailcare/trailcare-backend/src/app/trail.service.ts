import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { CareType, Prisma, PrismaService } from '@plusone/trailcare-persistence'

import { ActiveSession } from './auth/session.service'
import { toCareEntryDto } from './care-entry.mapper'
import { SweepSettingsDto } from './dto/sweep-settings.dto'
import { CreateTrailDto, TrailAreaDto, TrailAreaInputDto, TrailDto, UpdateTrailDto } from './dto/trail.dto'
import { rethrowPrismaError } from './prisma-errors'
import { computeSweepStatus, DEFAULT_SWEEP_THRESHOLDS, SweepThresholds } from './sweep-status'

const SWEEP_SETTINGS_ID = 1

const trailInclude = {
  trailArea: { select: { name: true } },
  aliases: { orderBy: { name: 'asc' } },
  careEntries: { orderBy: { id: 'desc' }, take: 1 },
} satisfies Prisma.TrailInclude

type TrailWithRelations = Prisma.TrailGetPayload<{ include: typeof trailInclude }>

@Injectable()
export class TrailService {
  constructor(private readonly prisma: PrismaService) {}

  async listTrailAreas(session?: ActiveSession): Promise<Array<TrailAreaDto>> {
    const [areas, lastSweeps, defaults] = await Promise.all([
      this.prisma.trailArea.findMany({
        orderBy: { name: 'asc' },
        include: { trails: { orderBy: { name: 'asc' }, include: trailInclude } },
      }),
      this.lastSweptAtByTrail(),
      this.getSweepSettings(),
    ])

    return areas.map((area) => ({
      id: area.id,
      name: area.name,
      trails: area.trails.map((trail) => toTrailDto(trail, lastSweeps.get(trail.id), defaults, session)),
    }))
  }

  async getTrail(trailId: number, session?: ActiveSession): Promise<TrailDto> {
    const trail = await this.prisma.trail.findUnique({ where: { id: trailId }, include: trailInclude })
    if (!trail) {
      throw new NotFoundException()
    }
    const [lastSweeps, defaults] = await Promise.all([this.lastSweptAtByTrail(trailId), this.getSweepSettings()])
    return toTrailDto(trail, lastSweeps.get(trailId), defaults, session)
  }

  async getSweepSettings(): Promise<SweepSettingsDto> {
    const settings = await this.prisma.sweepSettings.findUnique({ where: { id: SWEEP_SETTINGS_ID } })
    return toSweepSettingsDto(settings ?? DEFAULT_SWEEP_THRESHOLDS)
  }

  async updateSweepSettings(input: SweepSettingsDto): Promise<SweepSettingsDto> {
    validateThresholds(input.sweepGreenMaxDays, input.sweepYellowMaxDays)
    const data = { sweepGreenMaxDays: input.sweepGreenMaxDays, sweepYellowMaxDays: input.sweepYellowMaxDays }
    const settings = await this.prisma.sweepSettings.upsert({
      where: { id: SWEEP_SETTINGS_ID },
      create: { id: SWEEP_SETTINGS_ID, ...data },
      update: data,
    })
    return toSweepSettingsDto(settings)
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
    const { sweepGreenMaxDays, sweepYellowMaxDays } = validateOverride(
      input.sweepGreenMaxDays,
      input.sweepYellowMaxDays,
    )

    const trail = await this.prisma.trail
      .create({
        data: {
          name: input.name,
          trailAreaId,
          sweepGreenMaxDays,
          sweepYellowMaxDays,
          aliases: { create: uniqueAliases(input.aliases, input.name).map((name) => ({ name })) },
        },
        include: trailInclude,
      })
      .catch((error) => rethrowPrismaError(error, 'Ein Trail mit diesem Namen existiert in diesem Gebiet bereits'))

    return toTrailDto(trail, undefined, await this.getSweepSettings())
  }

  async updateTrail(trailId: number, input: UpdateTrailDto): Promise<TrailDto> {
    const existing = await this.prisma.trail.findUnique({ where: { id: trailId } })
    if (!existing) {
      throw new NotFoundException()
    }
    // Fields that are not sent keep their stored value, null resets to the global threshold
    const { sweepGreenMaxDays, sweepYellowMaxDays } = validateOverride(
      input.sweepGreenMaxDays === undefined ? existing.sweepGreenMaxDays : input.sweepGreenMaxDays,
      input.sweepYellowMaxDays === undefined ? existing.sweepYellowMaxDays : input.sweepYellowMaxDays,
    )

    await this.prisma.trail
      .update({
        where: { id: trailId },
        data: {
          name: input.name,
          trailAreaId: input.trailAreaId,
          sweepGreenMaxDays,
          sweepYellowMaxDays,
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

  /** The most recently entered sweep counts, so a correction ("yesterday" after "today") replaces the earlier entry */
  private async lastSweptAtByTrail(trailId?: number): Promise<Map<number, Date>> {
    const sweeps = await this.prisma.careEntry.findMany({
      where: { type: CareType.SWEPT, trailId },
      orderBy: { id: 'desc' },
      distinct: ['trailId'],
      select: { trailId: true, performedAt: true },
    })
    return new Map(sweeps.map((sweep) => [sweep.trailId, sweep.performedAt]))
  }
}

function toSweepSettingsDto(settings: SweepThresholds): SweepSettingsDto {
  return { sweepGreenMaxDays: settings.sweepGreenMaxDays, sweepYellowMaxDays: settings.sweepYellowMaxDays }
}

function toTrailDto(
  trail: TrailWithRelations,
  lastSweptAt: Date | undefined,
  defaults: SweepThresholds,
  session?: ActiveSession,
): TrailDto {
  const thresholds = {
    sweepGreenMaxDays: trail.sweepGreenMaxDays ?? defaults.sweepGreenMaxDays,
    sweepYellowMaxDays: trail.sweepYellowMaxDays ?? defaults.sweepYellowMaxDays,
  }
  const { status, daysSinceSwept } = computeSweepStatus(lastSweptAt, thresholds)
  const lastCareEntry = trail.careEntries[0]

  return {
    id: trail.id,
    name: trail.name,
    trailAreaId: trail.trailAreaId,
    trailAreaName: trail.trailArea.name,
    aliases: trail.aliases.map((alias) => alias.name),
    ...thresholds,
    hasCustomSweepThresholds: trail.sweepGreenMaxDays !== null,
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

/** A trail either deviates with both thresholds or with none, so green can never exceed the global yellow */
function validateOverride(green: number | null | undefined, yellow: number | null | undefined) {
  if (green == null && yellow == null) {
    return { sweepGreenMaxDays: null, sweepYellowMaxDays: null }
  }
  if (green == null || yellow == null) {
    throw new BadRequestException('Grün und Gelb können nur zusammen vom Standard abweichen')
  }
  validateThresholds(green, yellow)
  return { sweepGreenMaxDays: green, sweepYellowMaxDays: yellow }
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
