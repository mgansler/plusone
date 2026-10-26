import { Injectable, Logger } from '@nestjs/common'

import {
  createUpload,
  CreateUploadBody,
  exploreSegments,
  ExploreSegmentsParams,
  getActivityById,
  getActivityStreams,
  getClubById,
  getCommentsByActivityId,
  getEffortsBySegmentId,
  GetEffortsBySegmentId200Item,
  GetEffortsBySegmentIdParams,
  getGearById,
  getKudoersByActivityId,
  getLapsByActivityId,
  getLoggedInAthlete,
  getLoggedInAthleteActivities,
  GetLoggedInAthleteActivities200Item,
  getLoggedInAthleteClubs,
  GetLoggedInAthleteClubs200Item,
  getLoggedInAthleteStarredSegments,
  GetLoggedInAthleteStarredSegments200Item,
  getLoggedInAthleteZones,
  getRouteAsGPX,
  getRoutesByAthleteId,
  GetRoutesByAthleteId200Item,
  getSegmentById,
  getSegmentEffortById,
  getSegmentEffortStreams,
  GetSegmentEffortStreamsParams,
  getSegmentStreams,
  GetSegmentStreamsParams,
  getStats,
  getUploadById,
  getZonesByActivityId,
  updateLoggedInAthlete,
  UpdateLoggedInAthleteParams,
} from '@plusone/gpx-toolbox-api-client'

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'

/**
 * Helper: build Axios config with base URL + auth header.
 */
function stravaConfig(headers: Record<string, string>) {
  return { baseURL: STRAVA_API_BASE, headers }
}

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name)

  private authHeaders(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` }
  }

  // ── Internal helpers ─────────────────────────────────────────────────

  /**
   * Log a Strava API error with the relevant context (status, error body).
   * Avoids dumping the full Axios stack — just the facts you need to debug.
   */
  private logStravaError(context: string, error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const resp = (error as { response?: { status?: number; statusText?: string; data?: unknown } }).response
      if (resp) {
        this.logger.error(`Strava API error [${context}]: ${resp.status} ${resp.statusText}`, resp.data)
        return
      }
    }
    this.logger.error(`Strava API error [${context}]: ${error instanceof Error ? error.message : error}`)
  }

  /**
   * Wrap an Orval-generated Strava call: log on failure with status + error body.
   */
  private async withStravaLogging<T>(label: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.logStravaError(label, error)
      throw error
    }
  }

  // ── Athlete ──────────────────────────────────────────────────────────

  async getAthlete(accessToken: string): Promise<unknown> {
    const { data } = await this.withStravaLogging('getAthlete', () =>
      getLoggedInAthlete(stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getAthleteStats(accessToken: string, athleteId: number): Promise<unknown> {
    const { data } = await this.withStravaLogging('getAthleteStats', () =>
      getStats(athleteId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getAthleteZones(accessToken: string): Promise<unknown> {
    const { data } = await this.withStravaLogging('getAthleteZones', () =>
      getLoggedInAthleteZones(stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async updateAthlete(accessToken: string, params: UpdateLoggedInAthleteParams): Promise<unknown> {
    const { data } = await this.withStravaLogging('updateAthlete', () =>
      updateLoggedInAthlete(params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  // ── Activities ───────────────────────────────────────────────────────

  async getActivities(
    accessToken: string,
    params?: Parameters<typeof getLoggedInAthleteActivities>[0],
  ): Promise<Array<GetLoggedInAthleteActivities200Item>> {
    const { data } = await this.withStravaLogging('getActivities', () =>
      getLoggedInAthleteActivities(params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getActivity(accessToken: string, activityId: number): Promise<unknown> {
    const { data } = await this.withStravaLogging('getActivity', () =>
      getActivityById(activityId, undefined, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getActivityLaps(accessToken: string, activityId: number) {
    const { data } = await this.withStravaLogging('getActivityLaps', () =>
      getLapsByActivityId(activityId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getActivityZones(accessToken: string, activityId: number) {
    const { data } = await this.withStravaLogging('getActivityZones', () =>
      getZonesByActivityId(activityId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getActivityComments(accessToken: string, activityId: number) {
    const { data } = await this.withStravaLogging('getActivityComments', () =>
      getCommentsByActivityId(activityId, undefined, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getActivityKudoers(accessToken: string, activityId: number) {
    const { data } = await this.withStravaLogging('getActivityKudoers', () =>
      getKudoersByActivityId(activityId, undefined, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  // ── Routes ───────────────────────────────────────────────────────────

  async getRoutes(
    accessToken: string,
    athleteId: number,
    params?: Parameters<typeof getRoutesByAthleteId>[1],
  ): Promise<Array<GetRoutesByAthleteId200Item>> {
    const { data } = await this.withStravaLogging('getRoutes', () =>
      getRoutesByAthleteId(athleteId, params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getRoute(accessToken: string, routeId: string | number): Promise<unknown> {
    // Always use string ID to avoid JS number precision loss with large IDs
    const id = String(routeId)
    const response = await this.fetchStrava(`/routes/${id}`, accessToken)
    return response.json()
  }

  async downloadRouteGPX(accessToken: string, routeId: string | number): Promise<string> {
    // Always use string ID to avoid JS number precision loss with large IDs
    const id = String(routeId)
    const response = await this.fetchStrava(`/routes/${id}/export_gpx`, accessToken)
    if (!response.ok) {
      this.logger.error(`GPX download failed for route ${id}: ${response.status} ${response.statusText}`)
      throw new Error(`GPX download failed: ${response.status}`)
    }
    return response.json() as unknown as string
  }

  async downloadRouteTCX(accessToken: string, routeId: string | number): Promise<string> {
    // Always use string ID to avoid JS number precision loss with large IDs
    const id = String(routeId)
    const response = await this.fetchStrava(`/routes/${id}/export_tcx`, accessToken)
    if (!response.ok) {
      this.logger.error(`TCX download failed for route ${id}: ${response.status} ${response.statusText}`)
      throw new Error(`TCX download failed: ${response.status}`)
    }
    return response.json() as unknown as string
  }

  // ── Segments ─────────────────────────────────────────────────────────

  async getSegment(accessToken: string, segmentId: number): Promise<unknown> {
    const { data } = await this.withStravaLogging('getSegment', () =>
      getSegmentById(segmentId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getSegmentStreams(accessToken: string, segmentId: number, params: GetSegmentStreamsParams): Promise<unknown> {
    const { data } = await this.withStravaLogging('getSegmentStreams', () =>
      getSegmentStreams(segmentId, params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async exploreSegments(accessToken: string, params: ExploreSegmentsParams) {
    const { data } = await this.withStravaLogging('exploreSegments', () =>
      exploreSegments(params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getStarredSegments(
    accessToken: string,
    params?: Parameters<typeof getLoggedInAthleteStarredSegments>[0],
  ): Promise<Array<GetLoggedInAthleteStarredSegments200Item>> {
    const { data } = await this.withStravaLogging('getStarredSegments', () =>
      getLoggedInAthleteStarredSegments(params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  // ── Segment Efforts ──────────────────────────────────────────────────

  async getSegmentEffort(accessToken: string, effortId: number): Promise<unknown> {
    const { data } = await this.withStravaLogging('getSegmentEffort', () =>
      getSegmentEffortById(effortId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getSegmentEfforts(
    accessToken: string,
    params: GetEffortsBySegmentIdParams,
  ): Promise<Array<GetEffortsBySegmentId200Item>> {
    const { data } = await this.withStravaLogging('getSegmentEfforts', () =>
      getEffortsBySegmentId(params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getSegmentEffortStreams(
    accessToken: string,
    effortId: number,
    params: GetSegmentEffortStreamsParams,
  ): Promise<unknown> {
    const { data } = await this.withStravaLogging('getSegmentEffortStreams', () =>
      getSegmentEffortStreams(effortId, params, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  // ── Clubs ────────────────────────────────────────────────────────────

  async getClub(accessToken: string, clubId: number): Promise<unknown> {
    const { data } = await this.withStravaLogging('getClub', () =>
      getClubById(clubId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  async getAthleteClubs(accessToken: string): Promise<Array<GetLoggedInAthleteClubs200Item>> {
    const { data } = await this.withStravaLogging('getAthleteClubs', () =>
      getLoggedInAthleteClubs(undefined, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  // ── Gear ─────────────────────────────────────────────────────────────

  async getGear(accessToken: string, gearId: string): Promise<unknown> {
    const { data } = await this.withStravaLogging('getGear', () =>
      getGearById(gearId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  // ── Uploads ──────────────────────────────────────────────────────────

  async createUpload(accessToken: string, body: CreateUploadBody) {
    const { data } = await this.withStravaLogging('createUpload', () =>
      createUpload(
        body,
        stravaConfig({
          ...this.authHeaders(accessToken),
          'Content-Type': 'multipart/form-data',
        }),
      ),
    )
    return data
  }

  async getUpload(accessToken: string, uploadId: number): Promise<unknown> {
    const { data } = await this.withStravaLogging('getUpload', () =>
      getUploadById(uploadId, stravaConfig(this.authHeaders(accessToken))),
    )
    return data
  }

  /**
   * Download activity streams and return as track points.
   * Fetches latlng, altitude, time, heartrate, cadence and moving streams,
   * then merges them into a single array of TrackPoint objects.
   */
  async downloadActivityStreams(
    accessToken: string,
    activityId: number,
  ): Promise<
    Array<{
      latitude: number
      longitude: number
      elevation: number
      time: Date
      hr?: number
      cad?: number
      moving?: boolean
    }>
  > {
    const response = await getActivityStreams(
      activityId,
      {
        // @ts-expect-error - Strava expects `keys` as a comma-separated string, not an array
        keys: 'time,distance,latlng,altitude,heartrate,cadence,moving',
        key_by_type: true,
      },
      stravaConfig(this.authHeaders(accessToken)),
    )

    // Orval types the response as void, so we cast defensively.
    // With key_by_type: true the API returns { streamType: { data: [...] }, ... }.
    // On error it returns { message, errors } instead.
    const rawData: Record<string, { data: Array<number | boolean> }> = response.data ?? {}
    const streamMap: Record<string, Array<number | boolean>> = {}
    for (const [type, stream] of Object.entries(rawData)) {
      // Only accept known stream types; skip error keys like "message"/"errors".
      if (['time', 'distance', 'latlng', 'altitude', 'heartrate', 'cadence', 'moving'].includes(type)) {
        streamMap[type] = stream.data
      }
    }

    const latlngs = streamMap.latlng as unknown as Array<[number, number]> | undefined
    const altitudes = streamMap.altitude as Array<number> | undefined
    const times = streamMap.time as Array<number> | undefined
    const heartRates = streamMap.heartrate as Array<number> | undefined
    const cadences = streamMap.cadence as Array<number> | undefined
    const movings = streamMap.moving as Array<boolean> | undefined

    if (!latlngs || latlngs.length === 0) {
      this.logger.warn(`No latlng streams for activity ${activityId}, returning empty array`)
      return []
    }

    const result: Array<{
      latitude: number
      longitude: number
      elevation: number
      time: Date
      hr?: number
      cad?: number
      moving?: boolean
    }> = []

    for (let i = 0; i < latlngs.length; i++) {
      result.push({
        latitude: latlngs[i][0],
        longitude: latlngs[i][1],
        elevation: altitudes?.[i] ?? 0,
        time: times ? new Date(times[i] * 1000) : new Date(),
        hr: heartRates?.[i],
        cad: cadences?.[i],
        moving: movings?.[i],
      })
    }

    return result
  }

  // ── Legacy: GPX download (used by debug controller) ──────────────────

  /**
   * Download GPX for a Strava activity (polling wrapper).
   */
  async downloadActivityGpx(accessToken: string, activityId: string): Promise<string> {
    try {
      this.logger.log(`Requesting GPX export for activity ${activityId}`)

      // POST to request export, then poll
      await this.withStravaLogging(`downloadActivityGpx(${activityId})`, () =>
        getActivityById(Number(activityId), undefined, {
          ...stravaConfig(this.authHeaders(accessToken)),
          method: 'POST',
          url: `/activities/${activityId}/export_gpx`,
        }),
      )

      // Poll the export endpoint
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const { data } = await getRouteAsGPX(Number(activityId), stravaConfig(this.authHeaders(accessToken)))
        this.logger.log(`GPX export ready for activity ${activityId}`)
        return data as unknown as string
      }

      throw new Error('GPX export not ready after retries')
    } catch (error) {
      this.logStravaError(`downloadActivityGpx(${activityId})`, error)
      throw error
    }
  }

  // ── Legacy: generic fetch (used by debug controller) ─────────────────

  /**
   * Generic fetch for any Strava API endpoint.
   * Returns the raw Response for flexible handling.
   */
  async fetchStrava(
    endpoint: string,
    accessToken: string,
  ): Promise<{ ok: boolean; status: number; statusText: string; json: () => Promise<unknown> }> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${STRAVA_API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    const axios = (await import('axios')).default
    let response: { status: number; statusText: string; data: unknown }

    try {
      response = await axios({
        url,
        method: 'GET',
        headers: this.authHeaders(accessToken),
        validateStatus: () => true,
      })
    } catch (error) {
      this.logStravaError(`fetchStrava(${endpoint})`, error)
      throw error
    }

    if (response.status >= 400) {
      this.logger.error(`Strava API [${endpoint}]: ${response.status} ${response.statusText}`, response.data)
    }

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: () => Promise.resolve(response.data),
    }
  }
}
