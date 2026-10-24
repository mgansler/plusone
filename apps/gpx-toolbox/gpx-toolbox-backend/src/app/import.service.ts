import { Injectable, Logger } from '@nestjs/common'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'
import { analyzeGpx, calculateHaversineDistance, parseGpx, segmentTrack, TrackPoint } from '@plusone/gpx'

import { StravaService } from './strava.service'

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
    const existingMap = new Map(existing.map((r) => [r.stravaRouteId!, r.id]))

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
            const elevationLoss = this.calculateElevationLoss(points)
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
              const elevationLoss = this.calculateElevationLoss(points)
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
   */
  async importStravaActivity(accessToken: string, userId: string, activityId: string, autoMatch = true) {
    try {
      // Download GPX
      const gpxContent = await this.stravaService.downloadActivityGpx(accessToken, activityId)
      const points = parseGpx(gpxContent)

      if (points.length === 0) {
        throw new Error('No track points found in GPX')
      }

      // Compute stats
      const overview = analyzeGpx(gpxContent)
      const polyline = points.map((p) => ({ lat: p.latitude, lng: p.longitude }))
      const elevationLoss = this.calculateElevationLoss(points)
      const stats = {
        distance: overview.totalDistance,
        elevationGain: Math.round(overview.segments.reduce((sum, s) => sum + s.elevationGain, 0)),
        elevationLoss,
      }

      // Auto-match
      if (autoMatch) {
        const match = await this.findBestMatch(points, userId)
        if (match) {
          // Link activity to existing route
          await this.prisma.route.update({
            where: { id: match.routeId },
            data: { stravaActivityId: String(activityId) },
          })
          this.logger.log(`Auto-matched activity ${activityId} to route "${match.routeName}"`)
          return { imported: 1, matched: 1, newRoutes: 0, matchedRouteId: match.routeId }
        }
      }

      // Create new route
      const activityDetail = (await this.stravaService.getActivity(accessToken, Number(activityId))) as Awaited<
        ReturnType<typeof this.stravaService.getActivity>
      > & { name?: string; distance?: number }

      await this.prisma.route.create({
        data: {
          name: activityDetail.name ?? 'Imported Activity',
          description: activityDetail.distance ? `${(activityDetail.distance / 1000).toFixed(1)} km` : undefined,
          gpxContent,
          polyline: { points: JSON.stringify(polyline) },
          stats,
          source: 'stravaActivity',
          userId,
          stravaActivityId: String(activityId),
          ratingTags: [],
        },
      })

      this.logger.log(`Created new route from Strava activity ${activityId}`)
      return { imported: 1, matched: 0, newRoutes: 1 }
    } catch (error) {
      this.logger.error(`Failed to import Strava activity ${activityId}: ${error.message}`)
      throw error
    }
  }

  /**
   * Import all Strava activities (paginated).
   */
  async importAllActivities(accessToken: string, userId: string, _limit = 100) {
    const activities = await this.stravaService.getActivities(accessToken)
    let imported = 0
    let matched = 0
    let newRoutes = 0

    for (const activity of activities) {
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
   */
  async findBestMatch(
    points: Array<TrackPoint>,
    userId: string,
  ): Promise<{ routeId: string; routeName: string } | null> {
    const existingRoutes = await this.prisma.route.findMany({
      where: {
        userId,
        source: { in: ['manualImport', 'stravaRoute'] as const },
      },
      select: { id: true, name: true, polyline: true },
    })

    if (existingRoutes.length === 0) return null

    const activitySegments = segmentTrack(points)
    if (activitySegments.length === 0) return null

    let bestMatch: { routeId: string; routeName: string; distance: number } | null = null

    for (const route of existingRoutes) {
      const polyline = JSON.parse(route.polyline as string) as Array<{ lat: number; lng: number }>
      if (polyline.length === 0) continue

      const routePoints: Array<TrackPoint> = polyline.map((p) => ({
        latitude: p.lat,
        longitude: p.lng,
        elevation: 0,
        time: new Date(),
      }))
      const routeSegments = segmentTrack(routePoints)
      if (routeSegments.length === 0) continue

      // Compare using Modified Hausdorff Distance
      const mhd = this.computeModifiedHausdorffDistance(activitySegments, routeSegments)

      // Threshold: routes with MHD < 200m are considered a match
      const threshold = 200 // meters
      if (mhd < threshold && (!bestMatch || mhd < bestMatch.distance)) {
        bestMatch = { routeId: route.id, routeName: route.name, distance: mhd }
      }
    }

    if (bestMatch) {
      this.logger.log(`Best match: "${bestMatch.routeName}" with MHD ${Math.round(bestMatch.distance)}m`)
    }

    return bestMatch
  }

  /**
   * Compute Modified Hausdorff Distance between two track segment sets.
   * Uses the average of directed Hausdorff distances between matching segments.
   */
  private computeModifiedHausdorffDistance(
    segmentsA: Array<{ points: Array<TrackPoint> }>,
    segmentsB: Array<{ points: Array<TrackPoint> }>,
  ): number {
    let totalDistance = 0
    let matchCount = 0

    for (const segA of segmentsA) {
      let bestDist = Infinity
      for (const segB of segmentsB) {
        const dist = this.computeHausdorffDistance(segA.points, segB.points)
        if (dist < bestDist) bestDist = dist
      }
      if (bestDist < Infinity) {
        totalDistance += bestDist
        matchCount++
      }
    }

    return matchCount > 0 ? totalDistance / matchCount : Infinity
  }

  /**
   * Compute Hausdorff distance between two point arrays.
   * Uses a simplified approach: compare points at equivalent normalized positions.
   */
  private computeHausdorffDistance(pointsA: Array<TrackPoint>, pointsB: Array<TrackPoint>): number {
    if (pointsA.length === 0 || pointsB.length === 0) return Infinity

    // Downsample to same number of points for comparison
    const maxPoints = 100
    const downsample = (points: Array<TrackPoint>, n: number): Array<TrackPoint> => {
      const step = Math.max(1, Math.floor(points.length / n))
      return points.filter((_, i) => i % step === 0).slice(0, n)
    }

    const sampledA = downsample(pointsA, maxPoints)
    const sampledB = downsample(pointsB, maxPoints)

    // Interpolate to same length
    const length = Math.min(sampledA.length, sampledB.length)
    let maxDist = 0

    for (let i = 0; i < length; i++) {
      const dist = calculateHaversineDistance(
        { latitude: sampledA[i].latitude, longitude: sampledA[i].longitude },
        { latitude: sampledB[i].latitude, longitude: sampledB[i].longitude },
      )
      if (dist > maxDist) maxDist = dist
    }

    return maxDist
  }

  /**
   * Calculate total elevation loss from track points.
   */
  private calculateElevationLoss(points: Array<TrackPoint>): number {
    let loss = 0
    for (let i = 1; i < points.length; i++) {
      const diff = points[i - 1].elevation - points[i].elevation
      if (diff > 0) loss += diff
    }
    return Math.round(loss)
  }
}
