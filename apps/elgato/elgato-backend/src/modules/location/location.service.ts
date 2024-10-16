import { Injectable } from '@nestjs/common'

import { PrismaService } from '@plusone/elgato-persistence'
import { SunriseSunsetApiService } from '@plusone/nestjs-services'

import { LocationDataResponseDto } from './dto/location-data-response.dto'
import { LocationUpdateRequestDto } from './dto/location-update-request.dto'

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sunriseSunsetApi: SunriseSunsetApiService,
  ) {}

  async updateLocation({ name, longitude, latitude }: LocationUpdateRequestDto) {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.location.findFirst()
      if (current) {
        await tx.location.update({ where: { name: current.name }, data: { name, latitude, longitude } })
      } else {
        await tx.location.create({ data: { name, longitude, latitude } })
      }
    })
  }

  async getLocation() {
    return this.prisma.location.findFirstOrThrow()
  }

  async getLocationData(): Promise<LocationDataResponseDto> {
    const location = await this.prisma.location.findFirstOrThrow()
    return {
      ...location,
      ...(await this.sunriseSunsetApi.getLocationData(location))[0],
    }
  }
}
