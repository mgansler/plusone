import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

export type BRouterProfile = 'fastbike' | 'trekking' | 'mtb-zossebart'

export type Coordinate = {
  latitude: number
  longitude: number
}

export type BRouterResponse = {
  gpx: string
}

export type BRouterRoutesResponse = {
  routes: Array<{ gpx: string; alternativeIdx: number }>
}

@Injectable()
export class BRouterService {
  private readonly logger = new Logger(BRouterService.name)

  constructor(private readonly httpService: HttpService) {}

  /**
   * Berechnet eine Route über die BRouter-API und gibt das GPX zurück.
   * @param serverUrl Die Basis-URL des BRouter-Servers (z. B. https://bikerouter.de)
   * @param points Array von Coordinate-Objekten mit latitude und longitude
   * @param profile Das Routing-Profil (Standard: mtb-zossebart)
   * @param alternativeIdx Die Alternative-Nummer (Standard: 0)
   */
  async getRoute(
    serverUrl: string,
    points: Array<Coordinate>,
    profile: BRouterProfile = 'mtb-zossebart',
    alternativeIdx = 0,
  ): Promise<BRouterResponse> {
    const lonlats = points.map((p) => `${p.longitude},${p.latitude}`).join('|')

    this.logger.debug(
      `Fetching route from BRouter with ${points.length} points, profile: ${profile}, alternativeIdx: ${alternativeIdx}`,
    )

    const response = await firstValueFrom(
      this.httpService.get(`${serverUrl}/brouter-engine/brouter`, {
        params: {
          lonlats,
          profile,
          alternativeidx: alternativeIdx,
          format: 'gpx',
        },
      }),
    )

    this.logger.log(`Route fetched successfully from BRouter`)
    return { gpx: response.data }
  }

  /**
   * Berechnet 3 Routen-Alternativen parallel über die BRouter-API.
   * @param serverUrl Die Basis-URL des BRouter-Servers (z. B. https://bikerouter.de)
   * @param points Array von Coordinate-Objekten mit latitude und longitude
   * @param profile Das Routing-Profil (Standard: mtb-zossebart)
   */
  async getRoutes(
    serverUrl: string,
    points: Array<Coordinate>,
    profile: BRouterProfile = 'mtb-zossebart',
  ): Promise<BRouterRoutesResponse> {
    const lonlats = points.map((p) => `${p.longitude},${p.latitude}`).join('|')

    this.logger.debug(`Fetching 3 route alternatives from BRouter with ${points.length} points, profile: ${profile}`)

    // Fetch all 3 alternatives in parallel
    const promises = [0, 1, 2].map(async (idx) => {
      const response = await firstValueFrom(
        this.httpService.get(`${serverUrl}/brouter-engine/brouter`, {
          params: {
            lonlats,
            profile,
            alternativeidx: idx,
            format: 'gpx',
          },
        }),
      )
      return { gpx: response.data, alternativeIdx: idx }
    })

    const routes = await Promise.all(promises)
    this.logger.log(`Fetched ${routes.length} route alternatives from BRouter`)
    return { routes }
  }
}
