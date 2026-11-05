import { Injectable, Logger } from '@nestjs/common'

import { PrismaService, RouteStatus } from '@plusone/gpx-toolbox-persistence'
import {
  analyzePoints,
  calculateElevationLoss,
  computeBoundingBox,
  computeModifiedHausdorffDistance,
  expandBoundingBox,
  parseGpx,
  TrackPoint,
} from '@plusone/gpx-toolbox-utils'

import { parsePolyline } from './polyline.util'
import { routeFilterColumns } from './route-filter-columns.util'
import { extractGpxName } from './gpx-upload.util'

/** Routes with a Modified Hausdorff Distance below this value are considered a match. */
const MATCH_THRESHOLD_METER = 200
/** Only routes whose length differs by at most this fraction from the activity are compared. */
const MATCH_DISTANCE_TOLERANCE = 0.2
/** Sample spacing for the cheap first comparison pass. */
const COARSE_SAMPLE_SPACING_METER = 200

/** Activity data of an import */
type ActivityData = {
  name: string
  source: 'manualImport'
  riddenAt: Date
  duration: number | null
  avgHr: number | null
  maxHr: number | null
  autoMatch: boolean
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name)

  constructor(private readonly prisma: PrismaService) {}

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
        // Link activity to existing route and mark it as ridden. The link is the activity's routeId.
        await this.prisma.route.update({
          where: { id: match.routeId },
          data: { status: RouteStatus.ridden },
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
        source: 'manualImport',
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
