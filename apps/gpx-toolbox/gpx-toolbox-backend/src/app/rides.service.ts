import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

import { PrismaService, Route } from '@plusone/gpx-toolbox-persistence'

import { CreateFahrtDto, QueryFahrtDto, UpdateFahrtDto } from './dto/ride.dto'
import { buildFahrtListQuery } from './fahrt-list-query.util'
import { FahrtResponse, formatFahrt, PaginatedResponse, WeatherSummary } from './fahrt-response.util'
import { parsePolyline } from './polyline.util'

/** Subset of the Open-Meteo `daily` response we request */
type OpenMeteoDailyResponse = {
  daily?: {
    time?: Array<string>
    temperature_2m_max?: Array<number>
    temperature_2m_min?: Array<number>
    rain_sum?: Array<number>
    wind_gusts_10m_max?: Array<number>
  }
}

@Injectable()
export class RidesService {
  private readonly logger = new Logger(RidesService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * List fahrten for a route with optional filters and pagination.
   */
  async findAll(routeId: string, query: QueryFahrtDto, userId: string): Promise<PaginatedResponse<FahrtResponse>> {
    const { page = 1, limit = 50 } = query

    // Verify route exists and belongs to user
    const route = await this.prisma.route.findUnique({ where: { id: routeId, userId } })
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`)
    }

    const { where, orderBy } = buildFahrtListQuery(query, { routeId, userId })

    const all = await this.prisma.fahrt.findMany({
      where,
      orderBy,
    })

    const total = all.length
    const paginated = all.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((f) => formatFahrt(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get a single Fahrt by ID.
   */
  async findOne(id: string, userId: string): Promise<FahrtResponse> {
    const fahrt = await this.prisma.fahrt.findUnique({ where: { id, userId } })

    if (!fahrt) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    return formatFahrt(fahrt)
  }

  /**
   * Create a new Fahrt for a route.
   */
  async create(routeId: string, dto: CreateFahrtDto, userId: string): Promise<FahrtResponse> {
    // Verify route exists and belongs to user
    const route = await this.prisma.route.findUnique({ where: { id: routeId, userId } })
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`)
    }

    // Fetch weather forecast for the ridden date
    const weather = await this.fetchWeatherForRide(route, dto.riddenAt)

    const fahrt = await this.prisma.fahrt.create({
      data: {
        routeId,
        userId,
        title: dto.title,
        riddenAt: new Date(dto.riddenAt),
        duration: dto.duration,
        avgHr: dto.avgHr,
        maxHr: dto.maxHr,
        notes: dto.notes,
        weather: weather ? JSON.stringify(weather) : null,
      },
      include: { route: true },
    })

    this.logger.log(`Created Fahrt #${fahrt.id} for route "${route.name}"`)
    return formatFahrt(fahrt)
  }

  /**
   * Update a Fahrt.
   */
  async update(id: string, dto: UpdateFahrtDto, userId: string): Promise<FahrtResponse> {
    const existing = await this.prisma.fahrt.findUnique({ where: { id, userId } })
    if (!existing) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    const fahrt = await this.prisma.fahrt.update({
      where: { id, userId },
      data: dto,
      include: { route: true },
    })

    this.logger.log(`Updated Fahrt #${id}`)
    return formatFahrt(fahrt)
  }

  /**
   * Delete a Fahrt.
   */
  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.fahrt.findUnique({ where: { id, userId } })
    if (!existing) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    await this.prisma.fahrt.delete({ where: { id, userId } })
    this.logger.log(`Deleted Fahrt #${id}`)
  }

  /**
   * Get weather forecast for a route on a specific date.
   */
  async getWeatherForecast(routeId: string, date: string): Promise<WeatherSummary | null> {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } })
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`)
    }

    const polyline = parsePolyline(route.polyline)
    if (polyline.length === 0) return null

    const midIndex = Math.floor(polyline.length / 2)
    const midPoint = polyline[midIndex]

    return this.fetchWeatherAtCoordinates(midPoint.lat, midPoint.lng, date)
  }

  /**
   * Fetch weather data for a ride date using Open-Meteo historical API.
   */
  private async fetchWeatherForRide(route: Pick<Route, 'polyline'>, riddenAt: string): Promise<WeatherSummary | null> {
    const polyline = parsePolyline(route.polyline)
    if (polyline.length === 0) return null

    const midIndex = Math.floor(polyline.length / 2)
    const midPoint = polyline[midIndex]

    const riddenDate = new Date(riddenAt)
    const dateStr = riddenDate.toISOString().split('T')[0]

    return this.fetchWeatherAtCoordinates(midPoint.lat, midPoint.lng, dateStr)
  }

  /**
   * Fetch weather data from Open-Meteo for a specific date.
   */
  private async fetchWeatherAtCoordinates(
    latitude: number,
    longitude: number,
    date: string,
  ): Promise<WeatherSummary | null> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,rain_sum,wind_gusts_10m_max',
        start_date: date,
        end_date: date,
        timezone: 'UTC',
      })

      const response = await firstValueFrom(
        this.httpService.get<OpenMeteoDailyResponse>(`https://api.open-meteo.com/v1/forecast?${params.toString()}`),
      )

      const daily = response.data.daily
      if (!daily?.time?.[0]) return null

      return {
        date: daily.time[0],
        temperature2m: {
          max: daily.temperature_2m_max?.[0],
          min: daily.temperature_2m_min?.[0],
        },
        rain: {
          sum: daily.rain_sum?.[0],
        },
        windGusts: {
          max: daily.wind_gusts_10m_max?.[0],
        },
      }
    } catch (error) {
      this.logger.error(`Failed to fetch weather for ${latitude},${longitude} on ${date}: ${error.message}`)
      return null
    }
  }
}
