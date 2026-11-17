import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@plusone/trailcare-persistence'

import { isCareTeamOrAdmin } from './auth/auth.decorators'
import { ActiveSession } from './auth/session.service'
import { toCareNeedDto } from './care-need.mapper'
import { CareNeedDto, CreateCareNeedDto, UpdateCareNeedDto } from './dto/care-need.dto'

@Injectable()
export class CareNeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getCareNeeds(trailId: number): Promise<Array<CareNeedDto>> {
    const trail = await this.prisma.trail.findUnique({ where: { id: trailId } })
    if (!trail) {
      throw new NotFoundException('Trail nicht gefunden')
    }

    const careNeeds = await this.prisma.careNeed.findMany({
      where: { trailId },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    })
    return careNeeds.map(toCareNeedDto)
  }

  async createCareNeed(trailId: number, input: CreateCareNeedDto): Promise<CareNeedDto> {
    const trail = await this.prisma.trail.findUnique({ where: { id: trailId } })
    if (!trail) {
      throw new NotFoundException('Trail nicht gefunden')
    }

    // Verify category exists and is not soft-deleted
    const category = await this.prisma.careNeedCategory.findUnique({ where: { id: input.categoryId } })
    if (!category || category.deletedAt) {
      throw new BadRequestException('Kategorie nicht verfügbar')
    }

    const careNeed = await this.prisma.careNeed.create({
      data: {
        trailId,
        categoryId: input.categoryId,
        description: input.description || null,
      },
      include: { category: true },
    })
    return toCareNeedDto(careNeed)
  }

  async updateCareNeed(id: number, input: UpdateCareNeedDto): Promise<CareNeedDto> {
    const existing = await this.prisma.careNeed.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundException('Pflegebedarf nicht gefunden')
    }

    const data: any = {}
    if (input.categoryId !== undefined) {
      // Verify category exists and is not soft-deleted
      const category = await this.prisma.careNeedCategory.findUnique({ where: { id: input.categoryId } })
      if (!category || category.deletedAt) {
        throw new BadRequestException('Kategorie nicht verfügbar')
      }
      data.categoryId = input.categoryId
    }
    if (input.description !== undefined) {
      data.description = input.description || null
    }
    if (input.isDone !== undefined) {
      data.isDone = input.isDone
      if (input.isDone) {
        data.doneAt = new Date()
      } else {
        data.doneAt = null
      }
    }

    const careNeed = await this.prisma.careNeed.update({
      where: { id },
      data,
      include: { category: true },
    })
    return toCareNeedDto(careNeed)
  }

  async deleteCareNeed(id: number) {
    const existing = await this.prisma.careNeed.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundException('Pflegebedarf nicht gefunden')
    }
    await this.prisma.careNeed.delete({ where: { id } })
  }

  async toggleCareNeedDone(id: number): Promise<CareNeedDto> {
    const existing = await this.prisma.careNeed.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundException('Pflegebedarf nicht gefunden')
    }

    const isDone = !existing.isDone
    const careNeed = await this.prisma.careNeed.update({
      where: { id },
      data: {
        isDone,
        doneAt: isDone ? new Date() : null,
      },
      include: { category: true },
    })
    return toCareNeedDto(careNeed)
  }

  /** Check if the current session has access to care needs data */
  static canAccessCareNeeds(session?: ActiveSession): boolean {
    return session !== undefined && isCareTeamOrAdmin(session.role)
  }
}
