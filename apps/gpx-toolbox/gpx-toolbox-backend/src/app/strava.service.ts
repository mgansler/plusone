import { Injectable } from '@nestjs/common'

@Injectable()
export class StravaService {
  /**
   * Fetch athlete profile from Strava API.
   */
  async getAthlete(accessToken: string) {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Strava profile')
    }

    return response.json()
  }

  /**
   * Fetch athlete's routes from Strava.
   */
  async getRoutes(accessToken: string) {
    const response = await fetch('https://www.strava.com/api/v3/routes', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Strava routes')
    }

    return response.json()
  }

  /**
   * Fetch athlete's activities from Strava.
   */
  async getActivities(accessToken: string, after?: string, before?: string) {
    const params = new URLSearchParams({ limit: '100' })
    if (after) params.set('after', after)
    if (before) params.set('before', before)

    const response = await fetch(`https://www.strava.com/api/v3/activities?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Strava activities')
    }

    return response.json()
  }

  /**
   * Download GPX for a Strava activity.
   */
  async downloadActivityGpx(accessToken: string, activityId: string): Promise<string> {
    const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}/export`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to request GPX export')
    }

    const data = await response.json()
    const pollUrl = data.download_url

    // Poll until GPX is ready (Strava has a delay)
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const gpxResponse = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (gpxResponse.ok) {
        return gpxResponse.text()
      }
    }

    throw new Error('GPX export not ready after retries')
  }

  /**
   * Get detailed activity info from Strava.
   */
  async getActivity(accessToken: string, activityId: string) {
    const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Strava activity')
    }

    return response.json()
  }

  /**
   * Get detailed route info from Strava.
   */
  async getRoute(accessToken: string, routeId: string) {
    const response = await fetch(`https://www.strava.com/api/v3/routes/${routeId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Strava route')
    }

    return response.json()
  }

  /**
   * Generic fetch for any Strava API endpoint.
   * Returns the raw Response for flexible handling.
   */
  async fetchStrava(endpoint: string, accessToken: string): Promise<Response> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `https://www.strava.com/api/v3${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    return fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }
}
