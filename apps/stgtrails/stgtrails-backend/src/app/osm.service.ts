import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'

// https://nominatim.org/release-docs/develop/api/Reverse/#result-restriction
enum ZoomLevel {
  Country = 3,
  State = 5,
  County = 8,
  City = 10,
  Town = 12,
  Village = 13,
  Neighbourhood = 14,
  AnySettlement = 15,
  MajorStreets = 16,
  MajorAndMinorStreets = 17,
  Building = 18,
}

export type ReverseLookupArgs = {
  latitude: number
  longitude: number
}

const addressResponseSchema = z
  .object({
    country: z.string(),
    'ISO3166-2-lvl4': z.string().regex(/[A-Z]{2}-.{2}/),
    country_code: z.string().regex(/[a-z]{2}/),
    state: z.string(),
  })
  .transform((input) => ({
    country: input.country,
    countryCode: input.country_code,
    state: input.state,
    stateCode: input['ISO3166-2-lvl4'].split('-')[1].toLowerCase(),
  }))

@Injectable()
export class OsmService {
  private logger = new Logger(OsmService.name)

  public static UnknownLocation = 'unknown'

  constructor(private readonly httpService: HttpService) {}

  public async reverseLookup({
    latitude,
    longitude,
  }: ReverseLookupArgs): Promise<z.infer<typeof addressResponseSchema>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://nominatim.openstreetmap.org/reverse?addressdetails=1&format=json&lat=${latitude}&lon=${longitude}&zoom=${ZoomLevel.State}`,
          // {
          //   headers: new AxiosHeaders({
          //     'Accept-Language': 'en-US',
          //   }),
          // },
        ),
      )
      return addressResponseSchema.parse(response.data?.address)
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to get address data for coordinates: latitude=${latitude}, longitude=${longitude}`,
        error,
      )
      return {
        country: OsmService.UnknownLocation,
        countryCode: OsmService.UnknownLocation,
        state: OsmService.UnknownLocation,
        stateCode: OsmService.UnknownLocation,
      }
    }
  }
}
