import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { Prisma, PrismaService } from '@plusone/gpx-toolbox-persistence'
import { analyzeGpx, parseGpx, TrackPoint } from '@plusone/gpx-toolbox-utils'

import { CreateRouteDto, QueryRouteDto, UpdateRouteDto } from './dto/route.dto'
import { downsamplePolyline, parsePolyline } from './polyline.util'
import { routeFilterColumns } from './route-filter-columns.util'
import { extractGpxName } from './gpx-upload.util'

/** Nearby results draw many routes at once on the map; a coarse track per route is enough there */
const NEARBY_POLYLINE_MAX_POINTS = 300

/**
 * Internal route type with activities relation, used after querying.
 */
type RouteWithActivities = Prisma.RouteGetPayload<{ include: { activities: true } }>

/**
 * Formatted route output for API responses (without relation data).
 */
type FormattedRouteBase = {
  id: string
  name: string
  description: string | null
  source: string
  status: string
  ratingTags: unknown
  notes: string | null
  stats: unknown
  polyline: unknown
  createdAt: Date
  updatedAt: Date
}

/**
 * Formatted route output for API responses.
 */
type FormattedRoute = FormattedRouteBase & {
  activities: Array<{
    id: string
    riddenAt: Date
    duration: number | null
    avgHr: number | null
    maxHr: number | null
    notes: string | null
    weather: string | null
  }>
}

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name)

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Import a GPX file: parse, compute stats, extract polyline, create route.
   */
  async importGpx(
    gpxContent: string,
    dto: CreateRouteDto,
    userId: string,
  ): Promise<{
    id: string
    name: string
    totalDistance: number
    elevationGain: number
    elevationLoss: number
    /** True if `skipDuplicate` was set and the returned route already existed */
    duplicate: boolean
  }> {
    const points = parseGpx(gpxContent)

    if (points.length === 0) {
      throw new Error('No track points found in GPX file')
    }

    // Compute stats using libs/gpx
    const overview = analyzeGpx(gpxContent)

    // Extract polyline for spatial queries
    const polyline: Array<{ lat: number; lng: number }> = points.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }))

    // Calculate elevation loss (not provided by analyzeGpx)
    const elevationLoss = this.calculateElevationLoss(points)

    // Use GPX filename as default if no name provided
    const name = dto.name || extractGpxName(gpxContent) || 'Unbenannte Route'

    const stats = {
      distance: overview.totalDistance,
      elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
      elevationLoss,
    }

    // Lets an import be repeated without piling up copies of the same route
    if (dto.skipDuplicate) {
      const existing = await this.prismaService.route.findFirst({
        where: { userId, gpxContent },
        select: { id: true, name: true },
      })
      if (existing) {
        this.logger.log(`Skipped "${name}", the same GPX content exists as route ${existing.id}`)
        return {
          id: existing.id,
          name: existing.name,
          totalDistance: stats.distance,
          elevationGain: stats.elevationGain,
          elevationLoss,
          duplicate: true,
        }
      }
    }

    // Create route in DB
    const route = await this.prismaService.route.create({
      data: {
        name,
        description: dto.description,
        source: dto.source ?? 'manualImport',
        gpxContent,
        polyline: { points: JSON.stringify(polyline) },
        ...routeFilterColumns(polyline, stats),
        stats,
        ratingTags: [],
        userId,
      },
    })

    this.logger.log(`Imported route "${name}" with ${points.length} track points`)

    return {
      id: route.id,
      name: route.name,
      totalDistance: stats.distance,
      elevationGain: stats.elevationGain,
      elevationLoss,
      duplicate: false,
    }
  }

  /**
   * Get a route by ID with its activities relation.
   */
  async findById(id: string, userId: string): Promise<FormattedRoute> {
    const route = await this.prismaService.route.findUnique({
      where: { id, userId },
      include: { activities: { orderBy: { riddenAt: 'desc' } } },
    })

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`)
    }

    return this.formatRoute(route)
  }

  /**
   * List routes with optional filters and pagination.
   *
   * Note: JSON field filters (distance, elevation) are applied in-memory
   * because SQLite/Prisma JSON path filtering has limited support.
   */
  async findAll(
    query: QueryRouteDto,
    userId: string,
  ): Promise<{
    items: Array<FormattedRoute>
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const {
      status,
      source,
      sortBy = 'createdAt',
      order = 'DESC',
      minDistance,
      maxDistance,
      minElevation,
      maxElevation,
      page = 1,
      limit = 50,
    } = query

    // Build Prisma where clause (only non-JSON fields)
    const where: Prisma.RouteWhereInput = { userId }

    if (status) {
      where.status = status
    }
    if (source) {
      where.source = source
    }

    // Fetch all matching routes (SQLite JSON filtering is limited)
    const allRoutes = await this.prismaService.route.findMany({
      where,
      orderBy: { [sortBy]: order === 'ASC' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc },
      // The list shows the number of activities per route
      include: { activities: { orderBy: { riddenAt: 'desc' } } },
    })

    // Apply JSON field filters in-memory
    let filtered = allRoutes

    if (minDistance || maxDistance) {
      filtered = filtered.filter((route) => {
        const stats = this.parseJsonField(route.stats) as { distance?: number }
        const dist = stats.distance ?? 0
        if (minDistance && dist < minDistance) return false
        if (maxDistance && dist > maxDistance) return false
        return true
      })
    }

    if (minElevation || maxElevation) {
      filtered = filtered.filter((route) => {
        const stats = this.parseJsonField(route.stats) as { elevationGain?: number }
        const elev = stats.elevationGain ?? 0
        if (minElevation && elev < minElevation) return false
        if (maxElevation && elev > maxElevation) return false
        return true
      })
    }

    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((r) => this.formatRoute(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Update a route.
   */
  async update(id: string, dto: UpdateRouteDto, userId: string): Promise<FormattedRoute> {
    const existing = await this.prismaService.route.findUnique({ where: { id, userId }, select: { id: true } })
    if (!existing) {
      throw new NotFoundException(`Route with ID ${id} not found`)
    }

    const route = await this.prismaService.route.update({
      where: { id, userId },
      data: dto,
      include: { activities: { orderBy: { riddenAt: 'desc' } } },
    })

    return this.formatRoute(route)
  }

  /**
   * Delete a route. Its activities are deleted with it (`onDelete: Cascade`).
   */
  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.prismaService.route.findUnique({ where: { id, userId }, select: { id: true } })
    if (!existing) {
      throw new NotFoundException(`Route with ID ${id} not found`)
    }

    await this.prismaService.route.delete({
      where: { id, userId },
    })
    this.logger.log(`Deleted route ${id}`)
  }

  /**
   * Export a route as GPX XML.
   */
  async exportGpx(id: string, userId: string): Promise<string> {
    const route = await this.prismaService.route.findUnique({
      where: { id, userId },
      select: { gpxContent: true, name: true },
    })

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`)
    }

    return route.gpxContent
  }

  /**
   * Find routes within a radius of a point.
   * Uses Haversine distance to calculate distance from center to route midpoint.
   */
  async findNearby(latitude: number, longitude: number, radiusKm: number, userId: string) {
    const routes = await this.prismaService.route.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const results = routes
      .map((route) => {
        const polyline = parsePolyline(route.polyline)
        if (polyline.length === 0) return null

        // Use route midpoint for distance calculation
        const midIndex = Math.floor(polyline.length / 2)
        const midPoint = polyline[midIndex]
        const distance = this.calculateHaversineDistance(latitude, longitude, midPoint.lat, midPoint.lng)

        if (distance <= radiusKm * 1000) {
          return {
            id: route.id,
            name: route.name,
            distance: Math.round(distance),
            distanceKm: (distance / 1000).toFixed(2),
            status: route.status,
            source: route.source,
            stats: route.stats,
            polyline: downsamplePolyline(polyline, NEARBY_POLYLINE_MAX_POINTS),
          }
        }
        return null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.distance - b.distance)

    return results
  }

  private formatRoute(route: RouteWithActivities): FormattedRoute {
    return {
      id: route.id,
      name: route.name,
      description: route.description,
      source: route.source,
      status: route.status,
      ratingTags: typeof route.ratingTags === 'string' ? JSON.parse(route.ratingTags) : route.ratingTags,
      notes: route.notes,
      stats: typeof route.stats === 'string' ? JSON.parse(route.stats) : route.stats,
      polyline: parsePolyline(route.polyline),
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
      activities: route.activities,
    }
  }

  private parseJsonField(field: unknown): unknown {
    return typeof field === 'string' ? JSON.parse(field) : field
  }

  private calculateElevationLoss(points: Array<TrackPoint>): number {
    let loss = 0
    for (let i = 1; i < points.length; i++) {
      const diff = points[i - 1].elevation - points[i].elevation
      if (diff > 0) loss += diff
    }
    return Math.round(loss)
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6_371_000
    const toRad = (deg: number) => (deg * Math.PI) / 180

    const phi1 = toRad(lat1)
    const phi2 = toRad(lat2)
    const deltaPhi = toRad(lat2 - lat1)
    const deltaLambda = toRad(lon2 - lon1)

    const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2

    return R * 2 * Math.asin(Math.sqrt(a))
  }
}
