import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { Prisma, PrismaService } from '@plusone/gpx-toolbox-persistence'
import { analyzeGpx, parseGpx, TrackPoint } from '@plusone/gpx-toolbox-utils'

import { CreateRouteDto, QueryRouteDto, UpdateRouteDto } from './dto/route.dto'
import { StravaService } from './strava.service'

/**
 * Internal route type with fahrten relation, used after querying.
 */
type RouteWithFahrten = Prisma.RouteGetPayload<{ include: { fahrten: true } }>

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
  fahrten: Array<{
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

  constructor(
    private readonly prismaService: PrismaService,
    private readonly stravaService: StravaService,
  ) {}

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
    const name = dto.name || this.extractNameFromGpx(gpxContent)

    // Create route in DB
    const route = await this.prismaService.route.create({
      data: {
        name,
        description: dto.description,
        source: dto.source ?? 'manualImport',
        gpxContent,
        polyline: { points: JSON.stringify(polyline) },
        stats: {
          distance: overview.totalDistance,
          elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
          elevationLoss,
        },
        ratingTags: [],
        userId,
      },
    })

    this.logger.log(`Imported route "${name}" with ${points.length} track points`)

    return {
      id: route.id,
      name: route.name,
      totalDistance: overview.totalDistance,
      elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
      elevationLoss,
    }
  }

  /**
   * Get a route by ID with its fahrten relation.
   */
  async findById(id: string, userId: string): Promise<FormattedRoute> {
    const route = await this.prismaService.route.findUnique({
      where: { id, userId },
      include: { fahrten: { orderBy: { riddenAt: 'desc' } } },
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
      items: paginated.map((r) => this.formatRouteBase(r)) as Array<FormattedRoute>,
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
    const route = await this.prismaService.route.update({
      where: { id, userId },
      data: dto,
      include: { fahrten: { orderBy: { riddenAt: 'desc' } } },
    })

    return this.formatRoute(route)
  }

  /**
   * Delete a route.
   */
  async remove(id: string, userId: string): Promise<void> {
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
        const polyline = JSON.parse(route.polyline as string) as Array<{ lat: number; lng: number }>
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
          }
        }
        return null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.distance - b.distance)

    return results
  }

  /**
   * Create a route from Strava data (called by Strava import service).
   */
  async createFromStrava(
    stravaId: string,
    name: string,
    gpxContent: string,
    points: Array<TrackPoint>,
    userId?: string,
  ) {
    const overview = analyzeGpx(gpxContent)
    const polyline: Array<{ lat: number; lng: number }> = points.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }))
    const elevationLoss = this.calculateElevationLoss(points)

    const route = await this.prismaService.route.create({
      data: {
        name,
        source: 'stravaActivity',
        gpxContent,
        polyline: { points: JSON.stringify(polyline) },
        stats: {
          distance: overview.totalDistance,
          elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
          elevationLoss,
        },
        ratingTags: [],
        userId,
      },
    })

    return route
  }

  /**
   * Create a route from Strava Route API.
   * Downloads GPX from Strava, parses it, and stores both GPX content and polyline.
   */
  async createStravaRoute(stravaId: string, name: string, gpxContent: string, userId?: string) {
    const points = gpxContent ? parseGpx(gpxContent) : []
    const polyline: Array<{ lat: number; lng: number }> = points.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }))

    const stats = gpxContent
      ? (() => {
          const overview = analyzeGpx(gpxContent)
          const elevationLoss = this.calculateElevationLoss(points)
          return {
            distance: overview.totalDistance,
            elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
            elevationLoss,
          }
        })()
      : { distance: 0, elevationGain: 0, elevationLoss: 0 }

    return this.prismaService.route.create({
      data: {
        name,
        source: 'stravaRoute',
        stravaRouteId: stravaId,
        gpxContent,
        polyline: { points: JSON.stringify(polyline) },
        stats,
        ratingTags: [],
        userId,
      },
    })
  }

  /**
   * Link a Strava activity to an existing route (auto-match result).
   */
  async linkActivityToRoute(routeId: string, stravaActivityId: string): Promise<void> {
    await this.prismaService.route.update({
      where: { id: routeId },
      data: { stravaActivityId },
    })
  }

  /**
   * Get Strava activities with metadata, enriched with existing route data.
   * Used by the /fahrten/sync page to list activities for import as Fahrten.
   */
  async getStravaActivities(
    accessToken: string,
    userId: string,
  ): Promise<
    Array<{
      id: number
      name: string
      distance?: number
      elevationGain?: number
      moving_time?: number
      elapsed_duration?: number
      heart_rate_avg?: number
      heart_rate_max?: number
      start_date_local: string
      routeId?: string
      imported: boolean
    }>
  > {
    // Fetch all activities from Strava
    const activities = await this.stravaService.getActivities(accessToken)

    // Fetch existing routes that have stravaActivityId
    const routes = await this.prismaService.route.findMany({
      where: { userId, stravaActivityId: { not: null } },
      select: { id: true, stravaActivityId: true, stats: true, gpxContent: true, polyline: true },
    })
    const routeByActivity = new Map(
      routes.map((r) => [
        r.stravaActivityId!,
        {
          routeId: r.id,
          stats: r.stats,
          hasGpx: !!r.gpxContent,
        },
      ]),
    )

    // The Strava summary list does not include heart rate; source it from
    // already-imported Fahrten (stored from the detailed activity at import time).
    const fahrten = await this.prismaService.fahrt.findMany({
      where: { stravaActivityId: { in: activities.map((a) => String(a.id ?? 0)) } },
      select: { stravaActivityId: true, avgHr: true, maxHr: true },
    })
    const fahrtByActivity = new Map(fahrten.map((f) => [f.stravaActivityId!, { avgHr: f.avgHr, maxHr: f.maxHr }]))

    return activities.map((activity) => {
      const stravaId = activity.id ?? 0
      const routeInfo = routeByActivity.get(String(stravaId))
      const fahrtInfo = fahrtByActivity.get(String(stravaId))

      return {
        id: stravaId,
        name: activity.name ?? `Aktivität ${stravaId}`,
        distance: activity.distance,
        elevationGain: activity.total_elevation_gain,
        moving_time: activity.moving_time,
        elapsed_duration: activity.elapsed_time,
        heart_rate_avg: fahrtInfo?.avgHr ?? undefined,
        heart_rate_max: fahrtInfo?.maxHr ?? undefined,
        start_date_local: activity.start_date_local ?? new Date().toISOString(),
        routeId: routeInfo?.routeId,
        imported: !!routeInfo?.hasGpx,
      }
    })
  }

  private formatRouteBase(route: {
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
  }): FormattedRouteBase {
    return {
      id: route.id,
      name: route.name,
      description: route.description,
      source: route.source,
      status: route.status,
      ratingTags: typeof route.ratingTags === 'string' ? JSON.parse(route.ratingTags) : route.ratingTags,
      notes: route.notes,
      stats: typeof route.stats === 'string' ? JSON.parse(route.stats) : route.stats,
      polyline: typeof route.polyline === 'string' ? JSON.parse(route.polyline) : route.polyline,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    }
  }

  private formatRoute(route: RouteWithFahrten): FormattedRoute {
    return {
      id: route.id,
      name: route.name,
      description: route.description,
      source: route.source,
      status: route.status,
      ratingTags: typeof route.ratingTags === 'string' ? JSON.parse(route.ratingTags) : route.ratingTags,
      notes: route.notes,
      stats: typeof route.stats === 'string' ? JSON.parse(route.stats) : route.stats,
      polyline: typeof route.polyline === 'string' ? JSON.parse(route.polyline) : route.polyline,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
      fahrten: route.fahrten,
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

  private extractNameFromGpx(gpxContent: string): string {
    const nameMatch = gpxContent.match(/<trk\s[^>]*>([\s\S]*?)<\/trk>/)
    if (nameMatch) {
      const nameMatch2 = nameMatch[0].match(/<name[^>]*>([^<]+)<\/name>/)
      if (nameMatch2 && nameMatch2[1].trim()) {
        return nameMatch2[1].trim()
      }
    }
    return 'Unbenannte Route'
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
