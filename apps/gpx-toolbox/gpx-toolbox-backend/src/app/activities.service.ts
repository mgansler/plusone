import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { QueryActivityDto, UpdateActivityDto } from './dto/activity.dto'
import { buildActivityListQuery } from './activity-list-query.util'
import { ActivityWithRouteResponse, formatActivityWithRoute, PaginatedResponse } from './activity-response.util'

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all activities across all routes with optional date range filters and pagination.
   */
  async findAll(query: QueryActivityDto, userId: string): Promise<PaginatedResponse<ActivityWithRouteResponse>> {
    const { page = 1, limit = 50 } = query

    const { where, orderBy } = buildActivityListQuery(query, { userId })

    const all = await this.prisma.activity.findMany({
      where,
      include: { route: true },
      orderBy,
    })

    const total = all.length
    const paginated = all.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((f) => formatActivityWithRoute(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get a single activity by ID, including route info.
   */
  async findOne(id: string, userId: string): Promise<ActivityWithRouteResponse> {
    const activity = await this.prisma.activity.findUnique({
      where: { id, userId },
      include: { route: true },
    })

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`)
    }

    return formatActivityWithRoute(activity)
  }

  /**
   * Update an activity.
   */
  async update(id: string, dto: UpdateActivityDto, userId: string): Promise<ActivityWithRouteResponse> {
    const activity = await this.prisma.activity.update({
      where: { id, userId },
      data: dto,
      include: { route: true },
    })

    this.logger.log(`Updated activity #${id}`)
    return formatActivityWithRoute(activity)
  }

  /**
   * Delete an activity.
   */
  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.activity.findUnique({ where: { id, userId } })
    if (!existing) {
      throw new NotFoundException(`Activity with ID ${id} not found`)
    }

    await this.prisma.activity.delete({ where: { id, userId } })
    this.logger.log(`Deleted activity #${id}`)
  }
}
