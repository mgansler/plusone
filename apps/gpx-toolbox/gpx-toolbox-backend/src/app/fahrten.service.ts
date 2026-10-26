import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Prisma, PrismaService } from '@plusone/gpx-toolbox-persistence'

import { QueryFahrtDto, UpdateFahrtDto } from './dto/ride.dto'

@Injectable()
export class FahrtenService {
  private readonly logger = new Logger(FahrtenService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all fahrten across all routes with optional date range filters and pagination.
   */
  async findAll(
    query: QueryFahrtDto,
    userId: string,
  ): Promise<{
    items: Array<any>
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { dateFrom, dateTo, sortBy = 'riddenAt', order = 'DESC', page = 1, limit = 50 } = query

    const where: { riddenAt?: { gte?: Date; lte?: Date }; userId: string } = { userId }
    if (dateFrom || dateTo) {
      where.riddenAt = {}
      if (dateFrom) where.riddenAt.gte = new Date(dateFrom)
      if (dateTo) where.riddenAt.lte = new Date(dateTo)
    }

    const all = await this.prisma.fahrt.findMany({
      where,
      include: { route: true },
      orderBy: { [sortBy]: order === 'ASC' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc },
    })

    const total = all.length
    const paginated = all.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((f) => this.formatFahrt(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get a single Fahrt by ID, including route info.
   */
  async findOne(id: string, userId: string): Promise<any> {
    const fahrt = await this.prisma.fahrt.findUnique({
      where: { id, userId },
      include: { route: true },
    })

    if (!fahrt) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    return this.formatFahrt(fahrt)
  }

  /**
   * Update a Fahrt.
   */
  async update(id: string, dto: UpdateFahrtDto, userId: string): Promise<any> {
    const fahrt = await this.prisma.fahrt.update({
      where: { id, userId },
      data: dto,
      include: { route: true },
    })

    this.logger.log(`Updated Fahrt #${id}`)
    return this.formatFahrt(fahrt)
  }

  /**
   * Delete a Fahrt.
   */
  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.fahrt.findUnique({ where: { id, userId } })
    if (!existing) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    await this.prisma.fahrt.delete({ where: { id, userId } })
    this.logger.log(`Deleted Fahrt #${id}`)
  }

  private formatFahrt(fahrt: any): any {
    return {
      id: fahrt.id,
      routeId: fahrt.routeId,
      routeName: fahrt.route?.name,
      riddenAt: fahrt.riddenAt,
      duration: fahrt.duration,
      avgHr: fahrt.avgHr,
      maxHr: fahrt.maxHr,
      notes: fahrt.notes,
      weather: typeof fahrt.weather === 'string' ? JSON.parse(fahrt.weather) : fahrt.weather,
      createdAt: fahrt.createdAt,
      updatedAt: fahrt.updatedAt,
    }
  }
}
