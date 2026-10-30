import { Injectable, Logger } from '@nestjs/common'

import { PrismaService, RouteStatus } from '@plusone/gpx-toolbox-persistence'
import {
  analyzeGpx,
  analyzePoints,
  calculateElevationLoss,
  computeBoundingBox,
  computeModifiedHausdorffDistance,
  expandBoundingBox,
  parseGpx,
  serializeGpx,
  TrackPoint,
} from '@plusone/gpx-toolbox-utils'

import { parsePolyline } from './polyline.util'
import { routeFilterColumns } from './route-filter-columns.util'
import { StravaService } from './strava.service'
import { extractGpxName } from './gpx-upload.util'

/** Routes with a Modified Hausdorff Distance below this value are considered a match. */
const MATCH_THRESHOLD_METER = 200
/** Only routes whose length differs by at most this fraction from the activity are compared. */
const MATCH_DISTANCE_TOLERANCE = 0.2
/** Sample spacing for the cheap first comparison pass. */
const COARSE_SAMPLE_SPACING_METER = 200

/** Activity data shared by all import sources (Strava, GPX upload) */
type ActivityData = {
  name: string
  source: 'stravaActivity' | 'manualImport'
  stravaActivityId?: string
  riddenAt: Date
  duration: number | null
  avgHr: number | null
  maxHr: number | null
  autoMatch: boolean
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly stravaService: StravaService,
  ) {}

  /**
   * List Strava routes without importing (summary only).
   */
  async listStravaRoutes(
    accessToken: string,
    userId: string,
    athleteId: number,
  ): Promise<
    Array<{
      stravaId: number
      stravaIdStr: string
      name: string
      description?: string
      distance?: number
      elevationGain?: number
      imported: boolean
      stravaRouteId?: string
    }>
  > {
    const stravaRoutes = await this.stravaService.getRoutes(accessToken, athleteId)
    const existing = await this.prisma.route.findMany({
      where: { userId, source: 'stravaRoute' },
      select: { id: true, stravaRouteId: true },
    })
    const existingMap = new Map(existing.flatMap((r) => (r.stravaRouteId ? [[r.stravaRouteId, r.id] as const] : [])))

    return stravaRoutes.map((route) => ({
      stravaId: route.id ?? 0,
      stravaIdStr: route.id_str ?? String(route.id),
      name: route.name ?? `Route ${route.id}`,
      description: route.description,
      distance: route.distance,
      elevationGain: route.elevation_gain,
      imported: existingMap.has(route.id_str ?? String(route.id)),
    }))
  }

  /**
   * Import a single Strava route by its Strava ID string.
   */
  async importSingleStravaRoute(
    accessToken: string,
    userId: string,
    stravaIdStr: string,
  ): Promise<{ imported: boolean; matched: boolean; newRoutes: boolean }> {
    const existing = await this.prisma.route.findFirst({
      where: { stravaRouteId: stravaIdStr },
    })

    try {
      // Fetch route detail (name + distance) and GPX content
      const stravaRouteDetail = (await this.stravaService.getRoute(accessToken, stravaIdStr)) as {
        name?: string
        distance?: number
      }
      const routeName = stravaRouteDetail?.name ?? `Route ${stravaIdStr}`

      let gpxContent = ''
      try {
        gpxContent = await this.stravaService.downloadRouteGPX(accessToken, stravaIdStr)
      } catch {
        this.logger.warn(`No GPX available for route ${stravaIdStr}`)
      }

      const points = gpxContent ? parseGpx(gpxContent) : []
      const polyline = points.map((p) => ({ lat: p.latitude, lng: p.longitude }))

      const stats = gpxContent
        ? (() => {
            const overview = analyzeGpx(gpxContent)
            const elevationLoss = calculateElevationLoss(points)
            return {
              distance: overview.totalDistance,
              elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
              elevationLoss,
            }
          })()
        : { distance: 0, elevationGain: 0, elevationLoss: 0 }

      if (existing) {
        await this.prisma.route.update({
          where: { id: existing.id },
          data: {
            gpxContent,
            polyline: { points: JSON.stringify(polyline) },
            ...routeFilterColumns(polyline, stats),
            stats,
          },
        })
        return { imported: true, matched: false, newRoutes: false }
      }

      await this.prisma.route.create({
        data: {
          name: routeName,
          description: stravaRouteDetail?.distance ? `${(stravaRouteDetail.distance / 1000).toFixed(1)} km` : undefined,
          gpxContent,
          polyline: { points: JSON.stringify(polyline) },
          ...routeFilterColumns(polyline, stats),
          stats,
          source: 'stravaRoute',
          userId,
          stravaRouteId: stravaIdStr,
          ratingTags: [],
        },
      })
      this.logger.log(`Imported Strava route ${stravaIdStr}`)
      return { imported: true, matched: false, newRoutes: true }
    } catch (error) {
      this.logger.error(`Failed to import Strava route ${stravaIdStr}: ${error.message}`)
      throw error
    }
  }

  /**
   * Import all Strava routes for the authenticated user.
   */
  async importStravaRoutes(accessToken: string, userId: string, athleteId: number, force = false) {
    const stravaRoutes = await this.stravaService.getRoutes(accessToken, athleteId)
    let imported = 0
    let newRoutes = 0
    let matched = 0

    for (const route of stravaRoutes) {
      const stravaIdStr = route.id_str ?? String(route.id)
      const exists = await this.prisma.route.findFirst({
        where: { stravaRouteId: stravaIdStr },
      })

      if (exists && !force) {
        matched++
        continue
      }

      if (exists && force) {
        this.logger.log(`Re-importing Strava route ${stravaIdStr}`)
      }

      try {
        if (route.id === undefined) {
          this.logger.warn(`Skipping route without id: ${route.id}`)
          continue
        }

        const routeDetail = (await this.stravaService.getRoute(accessToken, stravaIdStr)) as { distance?: number }

        // Fetch GPX via dedicated endpoint (route map doesn't include GPX content)
        let gpxContent = ''
        try {
          gpxContent = await this.stravaService.downloadRouteGPX(accessToken, stravaIdStr)
        } catch {
          this.logger.warn(`No GPX available for route ${stravaIdStr}`)
        }

        const points = gpxContent ? parseGpx(gpxContent) : []
        const polyline = points.map((p) => ({ lat: p.latitude, lng: p.longitude }))

        const stats = gpxContent
          ? (() => {
              const overview = analyzeGpx(gpxContent)
              const elevationLoss = calculateElevationLoss(points)
              return {
                distance: overview.totalDistance,
                elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
                elevationLoss,
              }
            })()
          : { distance: 0, elevationGain: 0, elevationLoss: 0 }

        if (exists && force) {
          await this.prisma.route.update({
            where: { id: exists.id },
            data: {
              gpxContent,
              polyline: { points: JSON.stringify(polyline) },
              ...routeFilterColumns(polyline, stats),
              stats,
            },
          })
        } else {
          await this.prisma.route.create({
            data: {
              name: route.name ?? `Route ${stravaIdStr}`,
              description: routeDetail.distance ? `${(routeDetail.distance / 1000).toFixed(1)} km` : undefined,
              gpxContent,
              polyline: { points: JSON.stringify(polyline) },
              ...routeFilterColumns(polyline, stats),
              stats,
              source: 'stravaRoute',
              userId,
              stravaRouteId: String(route.id),
              ratingTags: [],
            },
          })
          newRoutes++
        }
        imported++
      } catch (error) {
        this.logger.error(`Failed to import Strava route ${route.id}: ${error.message}`)
      }
    }

    this.logger.log(`Imported ${imported} Strava routes (${newRoutes} new, ${matched} existing)`)
    return { imported, matched, newRoutes }
  }

  /**
   * Import a single Strava activity with auto-match to existing routes.
   * Creates a Route and an activity (with activity data: duration, HR, elevation).
   *
   * Uses the Strava streams API (GET /activities/{id}/streams) to obtain
   * track points instead of the unreliable GPX export endpoint.
   */
  async importStravaActivity(accessToken: string, userId: string, activityId: string, autoMatch = true) {
    try {
      // Fetch activity details (start_date_local, elapsed_time, heart rate, elevation)
      const activityDetail = (await this.stravaService.getActivity(accessToken, Number(activityId))) as {
        id?: number
        name?: string
        distance?: number
        total_elevation_gain?: number
        elapsed_time?: number
        average_heartrate?: number
        max_heartrate?: number
        start_date_local?: string
        moving_time?: number
        type?: string
      }

      // Download streams (latlng, altitude, time, heartrate, cadence, moving)
      this.logger.log(`Downloading streams for Strava activity ${activityId}`)
      const streamPoints = await this.stravaService.downloadActivityStreams(accessToken, Number(activityId))

      if (streamPoints.length === 0) {
        throw new Error('No track points found in activity streams')
      }

      // Convert stream points to TrackPoint type for downstream functions
      const points: Array<TrackPoint> = streamPoints.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        elevation: p.elevation,
        time: p.time,
        hr: p.hr,
        cad: p.cad,
      }))

      // Serialize the track points to a valid GPX 1.1 XML string for the gpxContent column.
      const name = activityDetail.name ?? 'Imported Activity'
      const gpxContent = serializeGpx(points, name)

      // Strava reports heart rate as floats; the activity columns are integers
      const result = await this.importActivity(points, gpxContent, userId, {
        name,
        source: 'stravaActivity',
        stravaActivityId: String(activityId),
        riddenAt: activityDetail.start_date_local ? new Date(activityDetail.start_date_local) : new Date(),
        duration: activityDetail.moving_time ?? activityDetail.elapsed_time ?? null,
        avgHr: activityDetail.average_heartrate != null ? Math.round(activityDetail.average_heartrate) : null,
        maxHr: activityDetail.max_heartrate != null ? Math.round(activityDetail.max_heartrate) : null,
        autoMatch,
      })
      this.logger.log(`Created activity from Strava activity ${activityId}`)

      return result
    } catch (error) {
      this.logger.error(`Failed to import Strava activity ${activityId}: ${error.message}`)
      throw error
    }
  }

  /**
   * Import a recorded activity from an uploaded GPX file.
   * Duration and heart rate are derived from the track points.
   */
  async importGpxActivity(gpxContent: string, userId: string, title?: string) {
    const points = parseGpx(gpxContent)
    if (points.length === 0) {
      throw new Error('No track points found in GPX file')
    }

    const startTime = points[0].time
    const heartRates = points.map((p) => Number(p.hr)).filter((hr) => Number.isFinite(hr) && hr > 0)
    const overview = analyzePoints(points)
    const name = title?.trim() || extractGpxName(gpxContent) || 'Imported Activity'

    const result = await this.importActivity(points, gpxContent, userId, {
      name,
      source: 'manualImport',
      riddenAt: startTime && !isNaN(startTime.getTime()) ? startTime : new Date(),
      duration: overview.totalDuration > 0 ? Math.round(overview.totalDuration) : null,
      avgHr: heartRates.length > 0 ? overview.overallAvgHeartRate : null,
      maxHr: heartRates.length > 0 ? Math.max(...heartRates) : null,
      autoMatch: true,
    })
    this.logger.log(`Created activity "${name}" from uploaded GPX`)
    return result
  }

  /**
   * Shared by all activity imports: links the track to a matching route (or creates a new one)
   * and creates an activity with the activity data.
   */
  private async importActivity(points: Array<TrackPoint>, gpxContent: string, userId: string, activity: ActivityData) {
    // Compute stats from track points
    const overview = analyzePoints(points)
    const polyline = points.map((p) => ({ lat: p.latitude, lng: p.longitude }))
    const elevationLoss = calculateElevationLoss(points)
    const stats = {
      distance: overview.totalDistance,
      elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
      elevationLoss,
    }

    let routeId: string | undefined
    let matched = 0
    let newRoutes = 0

    // Auto-match
    if (activity.autoMatch) {
      const match = await this.findBestMatch(points, userId, stats.distance)
      if (match) {
        // Link activity to existing route and mark it as ridden
        await this.prisma.route.update({
          where: { id: match.routeId },
          data: { stravaActivityId: activity.stravaActivityId, status: RouteStatus.ridden },
        })
        this.logger.log(`Auto-matched activity "${activity.name}" to route "${match.routeName}"`)
        routeId = match.routeId
        matched = 1
      }
    }

    // Create new route if no match
    if (!routeId) {
      const route = await this.prisma.route.create({
        data: {
          name: activity.name,
          description: `${(stats.distance / 1000).toFixed(1)} km`,
          gpxContent,
          polyline: { points: JSON.stringify(polyline) },
          ...routeFilterColumns(polyline, stats),
          stats,
          source: activity.source,
          userId,
          status: RouteStatus.ridden,
          stravaActivityId: activity.stravaActivityId,
          ratingTags: [],
        },
      })
      routeId = route.id
      newRoutes = 1
      this.logger.log(`Created new route from activity "${activity.name}"`)
    }

    // Create an activity from the activity data
    await this.prisma.activity.create({
      data: {
        routeId,
        userId,
        stravaActivityId: activity.stravaActivityId,
        title: activity.name,
        riddenAt: activity.riddenAt,
        duration: activity.duration,
        avgHr: activity.avgHr,
        maxHr: activity.maxHr,
      },
    })

    return { imported: 1, matched, newRoutes }
  }

  /**
   * Import all Strava activities (paginated).
   */
  async importAllActivities(accessToken: string, userId: string, limit = 100) {
    let allActivities: Array<{ id?: number }> = []
    let hasMore = true

    while (hasMore && allActivities.length < limit) {
      const page = Math.floor(allActivities.length / 200) + 1
      const newActivities = await this.stravaService.getActivities(accessToken, { page, per_page: 200 })
      allActivities = [...allActivities, ...newActivities]
      hasMore = newActivities.length === 200
    }

    // Respect the limit: only import up to `limit` activities
    const activitiesToImport = allActivities.slice(0, limit)
    let imported = 0
    let matched = 0
    let newRoutes = 0

    for (const activity of activitiesToImport) {
      const result = await this.importStravaActivity(accessToken, userId, String(activity.id), true)
      imported += result.imported
      matched += result.matched
      newRoutes += result.newRoutes
    }

    this.logger.log(`Imported ${imported} activities (${newRoutes} new, ${matched} matched)`)
    return { imported, matched, newRoutes }
  }

  /**
   * Find the best matching route for a new activity track using Modified Hausdorff Distance.
   *
   * Candidates are pre-filtered in SQL by bounding box and length, so only routes in the
   * same area with a similar distance have their polyline loaded and compared.
   *
   * @param distance Length of the activity in meters, computed the same way as `Route.distance`.
   */
  async findBestMatch(
    points: Array<TrackPoint>,
    userId: string,
    distance = analyzePoints(points).totalDistance,
  ): Promise<{ routeId: string; routeName: string } | null> {
    const activityBox = computeBoundingBox(points)
    if (!activityBox || points.length < 2) return null

    const searchBox = expandBoundingBox(activityBox, MATCH_THRESHOLD_METER)
    const candidates = await this.prisma.route.findMany({
      where: {
        userId,
        source: { in: ['manualImport', 'stravaRoute'] as const },
        // Bounding boxes overlap (activity box grown by the match threshold)
        minLat: { lte: searchBox.maxLat },
        maxLat: { gte: searchBox.minLat },
        minLng: { lte: searchBox.maxLng },
        maxLng: { gte: searchBox.minLng },
        distance: {
          gte: distance * (1 - MATCH_DISTANCE_TOLERANCE),
          lte: distance * (1 + MATCH_DISTANCE_TOLERANCE),
        },
      },
      select: { id: true, name: true, polyline: true },
    })

    let bestMatch: { routeId: string; routeName: string; distance: number } | null = null

    for (const route of candidates) {
      const routePoints = parsePolyline(route.polyline).map((p) => ({ latitude: p.lat, longitude: p.lng }))
      if (routePoints.length < 2) continue

      // Only distances below the current best (or the threshold) can change the result
      const limit = bestMatch?.distance ?? MATCH_THRESHOLD_METER

      // Coarse pass first: cheap, and a real match stays well below twice the limit
      const coarse = computeModifiedHausdorffDistance(points, routePoints, {
        sampleSpacingMeter: COARSE_SAMPLE_SPACING_METER,
        maxDistanceMeter: 2 * limit,
      })
      if (coarse === Infinity) continue

      const mhd = computeModifiedHausdorffDistance(points, routePoints, { maxDistanceMeter: limit })
      if (mhd < limit) {
        bestMatch = { routeId: route.id, routeName: route.name, distance: mhd }
      }
    }

    if (bestMatch) {
      this.logger.log(`Best match: "${bestMatch.routeName}" with MHD ${Math.round(bestMatch.distance)}m`)
      return { routeId: bestMatch.routeId, routeName: bestMatch.routeName }
    }

    return null
  }
}
