import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { PrismaService } from '@plusone/elgato-persistence'

import { LocationDataResponseDto } from './dto/location-data-response.dto'
import { LocationUpdateRequestDto } from './dto/location-update-request.dto'
import { SunriseSunsetResponseDto } from './dto/sunrise-sunset-response.dto'

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
            this.logger.error(error.response.data)
            throw `Could not connect to 'https://api.sunrisesunset.io'`
          }),
        ),
    )

    return {
      ...location,
      ...this.parseSunriseSunsetResult(sunriseSunsetData.data.results),
    }
  }

  private parseSunriseSunsetResult(result: SunriseSunsetResponseDto['results']) {
    return {
      sunrise: this.parseTimeEntry(result.sunrise),
      sunset: this.parseTimeEntry(result.sunset),
      firstLight: this.parseTimeEntry(result.first_light),
      lastLight: this.parseTimeEntry(result.last_light),
      dawn: this.parseTimeEntry(result.dawn),
      dusk: this.parseTimeEntry(result.dusk),
      solarNoon: this.parseTimeEntry(result.solar_noon),
      goldenHour: this.parseTimeEntry(result.golden_hour),
      dayLength: this.parseDayLength(result.day_length),
      timeZone: result.timezone,
      utcOffset: result.utc_offset,
    }
  }

  private parseTimeEntry(input: string): Date {
    const [time, AM_PM] = input.split(' ')
    const [hours, minutes, seconds] = time.split(':').map(Number)

    const normalizedHours = hours + (AM_PM === 'PM' ? 12 : 0)

    const date = new Date()

    date.setHours(normalizedHours, minutes, seconds, 0)

    return date
  }

  private parseDayLength(input: string): number {
    const [hours, minutes, seconds] = input.split(':').map(Number)

    return hours * 3600 + minutes * 60 + seconds
  }
}
