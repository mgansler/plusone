import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { PrismaService } from '@plusone/elgato-persistence'

import { LocationDataResponseDto } from './dto/location-data-response.dto'
import { LocationUpdateRequestDto } from './dto/location-update-request.dto'
import { SunriseSunsetResponseDto } from './dto/sunrise-sunset-response.dto'
import { locationDataResponseSchema } from './location-data-schema'

@Injectable()
export class LocationService {
  private logger = new Logger(LocationService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async updateLocation({ name, longitude, latitude }: LocationUpdateRequestDto) {
    await this.prismaService.$transaction(async (tx) => {
      const current = await tx.location.findFirst()
      if (current) {
        await tx.location.update({ where: { name: current.name }, data: { name, latitude, longitude } })
      } else {
        await tx.location.create({ data: { name, longitude, latitude } })
      }
    })
  }

  async getLocation() {
    return this.prismaService.location.findFirstOrThrow()
  }

  async getLocationData(): Promise<LocationDataResponseDto> {
    const location = await this.prismaService.location.findFirstOrThrow()

    const sunriseSunsetData = await firstValueFrom(
      this.httpService
        .get<SunriseSunsetResponseDto>(
          `https://api.sunrisesunset.io/json?lat=${location.latitude}&lng=${location.longitude}`,
          { timeout: 10_000 },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data)
            throw `Could not connect to 'https://api.sunrisesunset.io'`
          }),
        ),
    )

    try {
      const validatedSunriseSunsetData = locationDataResponseSchema.parse(sunriseSunsetData.data)
      return {
        ...location,
        ...validatedSunriseSunsetData.results,
      }
    } catch (e) {
      this.logger.error(e)
      throw new Error('Could not validate location data.')
    }
  }
}
