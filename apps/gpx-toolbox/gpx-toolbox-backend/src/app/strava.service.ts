import { Injectable } from '@nestjs/common'

import {
  createUpload,
  CreateUploadBody,
  exploreSegments,
  ExploreSegmentsParams,
  getActivityById,
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
  getRouteAsTCX,
  getRouteById,
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
  private authHeaders(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` }
  }

  // ── Athlete ──────────────────────────────────────────────────────────

  async getAthlete(accessToken: string): Promise<unknown> {
    const { data } = await getLoggedInAthlete(stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getAthleteStats(accessToken: string, athleteId: number): Promise<unknown> {
    const { data } = await getStats(athleteId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getAthleteZones(accessToken: string): Promise<unknown> {
    const { data } = await getLoggedInAthleteZones(stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async updateAthlete(accessToken: string, params: UpdateLoggedInAthleteParams): Promise<unknown> {
    const { data } = await updateLoggedInAthlete(params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Activities ───────────────────────────────────────────────────────

  async getActivities(
    accessToken: string,
    params?: Parameters<typeof getLoggedInAthleteActivities>[0],
  ): Promise<Array<GetLoggedInAthleteActivities200Item>> {
    const { data } = await getLoggedInAthleteActivities(params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getActivity(accessToken: string, activityId: number): Promise<unknown> {
    const { data } = await getActivityById(activityId, undefined, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getActivityLaps(accessToken: string, activityId: number) {
    const { data } = await getLapsByActivityId(activityId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getActivityZones(accessToken: string, activityId: number) {
    const { data } = await getZonesByActivityId(activityId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getActivityComments(accessToken: string, activityId: number) {
    const { data } = await getCommentsByActivityId(activityId, undefined, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getActivityKudoers(accessToken: string, activityId: number) {
    const { data } = await getKudoersByActivityId(activityId, undefined, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Routes ───────────────────────────────────────────────────────────

  async getRoutes(
    accessToken: string,
    athleteId: number,
    params?: Parameters<typeof getRoutesByAthleteId>[1],
  ): Promise<Array<GetRoutesByAthleteId200Item>> {
    const { data } = await getRoutesByAthleteId(athleteId, params, stravaConfig(this.authHeaders(accessToken)))
    console.log()
    return data
  }

  async getRoute(accessToken: string, routeId: string | number): Promise<unknown> {
    // Always use string ID to avoid JS number precision loss with large IDs
    const id = String(routeId)
    const response = await this.fetchStrava(`/routes/${id}`, accessToken)
    return response.json()
  }

  async downloadRouteGPX(accessToken: string, routeId: string | number): Promise<Blob> {
    // Always use string ID to avoid JS number precision loss with large IDs
    const id = String(routeId)
    const response = await this.fetchStrava(`/routes/${id}/export_gpx`, accessToken)
    if (!response.ok) throw new Error(`GPX download failed: ${response.status}`)
    // fetchStrava uses axios — for non-JSON (GPX XML) it returns the raw data
    return response.json() as unknown as Blob
  }

  async downloadRouteTCX(accessToken: string, routeId: string | number): Promise<Blob> {
    // Always use string ID to avoid JS number precision loss with large IDs
    const id = String(routeId)
    const response = await this.fetchStrava(`/routes/${id}/export_tcx`, accessToken)
    if (!response.ok) throw new Error(`TCX download failed: ${response.status}`)
    return response.json() as unknown as Blob
  }

  // ── Segments ─────────────────────────────────────────────────────────

  async getSegment(accessToken: string, segmentId: number): Promise<unknown> {
    const { data } = await getSegmentById(segmentId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getSegmentStreams(accessToken: string, segmentId: number, params: GetSegmentStreamsParams): Promise<unknown> {
    const { data } = await getSegmentStreams(segmentId, params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async exploreSegments(accessToken: string, params: ExploreSegmentsParams) {
    const { data } = await exploreSegments(params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getStarredSegments(
    accessToken: string,
    params?: Parameters<typeof getLoggedInAthleteStarredSegments>[0],
  ): Promise<Array<GetLoggedInAthleteStarredSegments200Item>> {
    const { data } = await getLoggedInAthleteStarredSegments(params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Segment Efforts ──────────────────────────────────────────────────

  async getSegmentEffort(accessToken: string, effortId: number): Promise<unknown> {
    const { data } = await getSegmentEffortById(effortId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getSegmentEfforts(
    accessToken: string,
    params: GetEffortsBySegmentIdParams,
  ): Promise<Array<GetEffortsBySegmentId200Item>> {
    const { data } = await getEffortsBySegmentId(params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getSegmentEffortStreams(
    accessToken: string,
    effortId: number,
    params: GetSegmentEffortStreamsParams,
  ): Promise<unknown> {
    const { data } = await getSegmentEffortStreams(effortId, params, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Clubs ────────────────────────────────────────────────────────────

  async getClub(accessToken: string, clubId: number): Promise<unknown> {
    const { data } = await getClubById(clubId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  async getAthleteClubs(accessToken: string): Promise<Array<GetLoggedInAthleteClubs200Item>> {
    const { data } = await getLoggedInAthleteClubs(undefined, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Gear ─────────────────────────────────────────────────────────────

  async getGear(accessToken: string, gearId: string): Promise<unknown> {
    const { data } = await getGearById(gearId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Uploads ──────────────────────────────────────────────────────────

  async createUpload(accessToken: string, body: CreateUploadBody) {
    const { data } = await createUpload(
      body,
      stravaConfig({
        ...this.authHeaders(accessToken),
        'Content-Type': 'multipart/form-data',
      }),
    )
    return data
  }

  async getUpload(accessToken: string, uploadId: number): Promise<unknown> {
    const { data } = await getUploadById(uploadId, stravaConfig(this.authHeaders(accessToken)))
    return data
  }

  // ── Legacy: GPX download (used by debug controller) ──────────────────

  /**
   * Download GPX for a Strava activity (polling wrapper).
   */
  async downloadActivityGpx(accessToken: string, activityId: string): Promise<string> {
    // POST to request export, then poll
    await getActivityById(Number(activityId), undefined, {
      ...stravaConfig(this.authHeaders(accessToken)),
      method: 'POST',
      url: `/activities/${activityId}/export_gpx`,
    })

    // Poll the export endpoint
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { data } = await getRouteAsGPX(Number(activityId), stravaConfig(this.authHeaders(accessToken)))
      return data as unknown as string
    }

    throw new Error('GPX export not ready after retries')
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
    const response = await axios({
      url,
      method: 'GET',
      headers: this.authHeaders(accessToken),
      validateStatus: () => true,
    })

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: () => Promise.resolve(response.data),
    }
  }
}
