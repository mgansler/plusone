import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService, Role } from '@plusone/trailcare-persistence'

import { ActiveSession } from './auth/session.service'
import { toCareEntryDto, undoableUntil } from './care-entry.mapper'
import { CareEntryDto, CreateCareEntryDto, UpdateCareEntryDto } from './dto/care-entry.dto'

/** Allow some clock skew between phone and server */
const MAX_FUTURE_MS = 5 * 60 * 1000

@Injectable()
export class CareService {
  constructor(private readonly prisma: PrismaService) {}

  async listEntries(trailId: number, session?: ActiveSession): Promise<Array<CareEntryDto>> {
    await this.requireTrail(trailId)
    const entries = await this.prisma.careEntry.findMany({
      where: { trailId },
      orderBy: [{ performedAt: 'desc' }, { id: 'desc' }],
    })
    return entries.map((entry) => toCareEntryDto(entry, session))
  }

  async createEntry(trailId: number, input: CreateCareEntryDto, session: ActiveSession): Promise<CareEntryDto> {
    await this.requireTrail(trailId)
    const performedAt = input.performedAt ?? new Date()
    validatePerformedAt(performedAt)

    const entry = await this.prisma.careEntry.create({
      data: {
        trailId,
        type: input.type,
        performedAt,
        comment: emptyToNull(input.comment),
        performedBy: emptyToNull(input.performedBy),
        createdBySessionId: session.id,
      },
    })
    return toCareEntryDto(entry, session)
  }

  async updateEntry(entryId: number, input: UpdateCareEntryDto, session: ActiveSession): Promise<CareEntryDto> {
    await this.requireEntry(entryId)
    if (input.performedAt) {
      validatePerformedAt(input.performedAt)
    }

    const entry = await this.prisma.careEntry.update({
      where: { id: entryId },
      data: {
        type: input.type,
        performedAt: input.performedAt,
        comment: input.comment === undefined ? undefined : emptyToNull(input.comment),
        performedBy: input.performedBy === undefined ? undefined : emptyToNull(input.performedBy),
      },
    })
    return toCareEntryDto(entry, session)
  }

  /** Admins may delete any entry, everybody else only undo their own entry shortly after creating it */
  async deleteEntry(entryId: number, session: ActiveSession): Promise<void> {
    const entry = await this.requireEntry(entryId)
    if (session.role !== Role.ADMIN && !undoableUntil(entry, session)) {
      throw new ForbiddenException('Der Eintrag kann nicht mehr rückgängig gemacht werden')
    }
    await this.prisma.careEntry.delete({ where: { id: entryId } })
  }

  private async requireTrail(trailId: number) {
    if ((await this.prisma.trail.count({ where: { id: trailId } })) === 0) {
      throw new NotFoundException()
    }
  }

  private async requireEntry(entryId: number) {
    const entry = await this.prisma.careEntry.findUnique({ where: { id: entryId } })
    if (!entry) {
      throw new NotFoundException()
    }
    return entry
  }
}

function validatePerformedAt(performedAt: Date) {
  if (performedAt.getTime() > Date.now() + MAX_FUTURE_MS) {
    throw new BadRequestException('Das Datum darf nicht in der Zukunft liegen')
  }
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
