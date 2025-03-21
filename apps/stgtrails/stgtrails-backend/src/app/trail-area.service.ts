import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { lastValueFrom } from 'rxjs'

import { Prisma, PrismaService } from '@plusone/stgtrails-persistence'

import { AppService } from './app.service'
import { CountryListResponseDto } from './dto/country-list-response.dto'
import { TrailAreaCreateFromCoordinatesDto } from './dto/trail-area-create-from-coordinates.dto'
import { TrailAreaCreateFromUrlDto } from './dto/trail-area-create-from-url.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailUpdateDto } from './dto/trail-update.dto'
import { OsmService } from './osm.service'

import TrailAreaCreateArgs = Prisma.TrailAreaCreateArgs

@Injectable()
export class TrailAreaService implements OnModuleInit {
  private logger = new Logger(TrailAreaService.name)

  constructor(
    private readonly appService: AppService,
    private readonly osmService: OsmService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit(): Promise<void> {
    const trailAreas = await this.findTrailAreasWithUnknownCountryAndState()
    if (trailAreas.length > 0) {
      this.logger.log(`There are ${trailAreas.length} trail areas without state/country information, updating now.`)
      for (const trailArea of trailAreas) {
        const address = await this.osmService.reverseLookup({
          latitude: trailArea.latitude,
          longitude: trailArea.longitude,
        })
        await this.updateTrailAreaCountryAndState(trailArea.id, address.countryCode, address.stateCode)
      }
    }
  }

  public async createTrailAreaFromCoordinates(input: TrailAreaCreateFromCoordinatesDto) {
    return this.createTrailArea(input)
  }

  public async createTrailAreaFromUrl(input: TrailAreaCreateFromUrlDto) {
    try {
      // Do not follow redirects, we want the redirect from the first call
      await lastValueFrom(this.httpService.get(input.mapsShortUrl, { maxRedirects: 0 }))
    } catch (e) {
      // HTTP Status Code 302 will be treated as an error
      if (e.response) {
        const redirectUrl: string = (e.response as AxiosResponse).headers['location']
        // redirect URL looks like this: https://www.google.de/maps/search/<latitude>,+<longitude>
        // latitude and longitude can be negative and are seperated by ,+
        const matchRes = redirectUrl.match(/^https:\/\/www\.google\.de\/maps\/search\/(-?\d+\.\d+),\+(-?\d+\.\d+)/)
        if (Array.isArray(matchRes)) {
          const latitude = Number(matchRes[1])
          const longitude = Number(matchRes[2])
          return this.createTrailArea({ latitude, longitude, name: input.name, threshold: input.threshold })
        } else {
          this.logger.warn(`Failed to extract coordinates from request with url: ${input.mapsShortUrl}`)
        }
      }
    }
  }

  public async

  public async getTrailAreas(): Promise<Array<TrailAreaResponseDto>> {
    return this.prisma.trailArea.findMany()
  }

  public async updateTrailArea(trailAreaId: number, trail: TrailAreaUpdateDto) {
    const trailArea = await this.prisma.trailArea.update({
      where: { id: trailAreaId },
      data: trail,
    })
    await this.appService.fetchDataForNewArea(trailArea)
    return trailArea
  }

  public async deleteTrailArea(trailAreaId: number) {
    if ((await this.prisma.trail.count({ where: { trailAreaId } })) > 0) {
      throw new Error("Can't delete a trail area with attached trails.")
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.sunriseSunset.deleteMany({ where: { trailAreaId } })
      await tx.weatherData.deleteMany({ where: { trailAreaId } })
      return tx.trailArea.delete({ where: { id: trailAreaId } })
    })
  }

  public async createTrail(trailAreaId: number, trail: TrailCreateDto) {
    return this.prisma.trail.create({ data: { name: trail.name, trailAreaId } })
  }

  public async getTrailsOfArea(trailAreaId: number) {
    return this.prisma.trail.findMany({ where: { trailAreaId } })
  }

  public async updateTrail(trailId: number, trail: TrailUpdateDto) {
    return this.prisma.trail.update({ where: { id: trailId }, data: trail })
  }

  public async deleteTrail(trailId: number) {
    return this.prisma.trail.delete({ where: { id: trailId } })
  }

  private async createTrailArea(data: TrailAreaCreateArgs['data']) {
    const address = await this.osmService.reverseLookup({ latitude: data.latitude, longitude: data.longitude })
    const trailArea = await this.prisma.trailArea.create({
      data: { ...data, country: address.countryCode, state: address.stateCode },
    })
    await this.appService.fetchDataForNewArea(trailArea)
    return trailArea
  }

  private async findTrailAreasWithUnknownCountryAndState(): Promise<Array<TrailAreaResponseDto>> {
    return this.prisma.trailArea.findMany({
      where: { AND: [{ country: OsmService.UnknownLocation }, { state: OsmService.UnknownLocation }] },
    })
  }

  private async updateTrailAreaCountryAndState(trailAreaId: number, country: string, state: string) {
    return this.prisma.trailArea.update({
      where: { id: trailAreaId },
      data: { country, state },
    })
  }

  public async getCountries(): Promise<Array<CountryListResponseDto>> {
    return this.prisma.trailArea.findMany({
      distinct: ['country', 'state'],
      select: { country: true, state: true },
    })
  }
}
