import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { QueryFahrtDto, UpdateFahrtDto } from './dto/ride.dto'
import { buildFahrtListQuery } from './fahrt-list-query.util'
import { FahrtWithRouteResponse, formatFahrtWithRoute, PaginatedResponse } from './fahrt-response.util'

@Injectable()
export class FahrtenService {
  private readonly logger = new Logger(FahrtenService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all fahrten across all routes with optional date range filters and pagination.
   */
  async findAll(query: QueryFahrtDto, userId: string): Promise<PaginatedResponse<FahrtWithRouteResponse>> {
    const { page = 1, limit = 50 } = query

    const { where, orderBy } = buildFahrtListQuery(query, { userId })

    const all = await this.prisma.fahrt.findMany({
      where,
      include: { route: true },
      orderBy,
    })

    const total = all.length
    const paginated = all.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((f) => formatFahrtWithRoute(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get a single Fahrt by ID, including route info.
   */
  async findOne(id: string, userId: string): Promise<FahrtWithRouteResponse> {
    const fahrt = await this.prisma.fahrt.findUnique({
      where: { id, userId },
      include: { route: true },
    })

    if (!fahrt) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    return formatFahrtWithRoute(fahrt)
  }

  /**
   * Update a Fahrt.
   */
  async update(id: string, dto: UpdateFahrtDto, userId: string): Promise<FahrtWithRouteResponse> {
    const fahrt = await this.prisma.fahrt.update({
      where: { id, userId },
      data: dto,
      include: { route: true },
    })

    this.logger.log(`Updated Fahrt #${id}`)
    return formatFahrtWithRoute(fahrt)
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
}
