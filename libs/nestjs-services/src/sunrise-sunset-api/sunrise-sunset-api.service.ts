import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { LocationDataResponse, sunriseSunsetApiResponseSchema } from './sunrise-sunset-api.schema'
import { SunriseSunsetResponseDto } from './sunrise-sunset-response.dto'

export type GeographicalCoordinates = {
  longitude: number
  latitude: number
  dateStart?: Date
  dateEnd?: Date
}

@Injectable()
export class SunriseSunsetApiService {
  private readonly logger = new Logger(SunriseSunsetApiService.name)

  constructor(private readonly httpService: HttpService) {}

  async getLocationData({
    longitude,
    latitude,
    dateStart,
    dateEnd,
  }: GeographicalCoordinates): Promise<LocationDataResponse> {
    const searchParams = new URLSearchParams()
    searchParams.set('lat', latitude.toString())
    searchParams.set('lng', longitude.toString())
    searchParams.set('date_start', this.formatDate(dateStart ?? new Date()))
    searchParams.set('date_end', this.formatDate(dateEnd ?? new Date()))

    const sunriseSunsetData = await firstValueFrom(
      this.httpService
        .get<SunriseSunsetResponseDto>(`https://api.sunrisesunset.io/json?${searchParams.toString()}`, {
          timeout: 10_000,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data)
            throw `Could not connect to 'https://api.sunrisesunset.io'`
          }),
        ),
    )

    try {
      return sunriseSunsetApiResponseSchema.parse(sunriseSunsetData.data).results
    } catch (e) {
      this.logger.error(e)
      throw new Error('Could not validate location data.')
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  }
}
