import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

import { PrismaService, Route } from '@plusone/gpx-toolbox-persistence'

import { CreateActivityDto, QueryActivityDto, UpdateActivityDto } from './dto/activity.dto'
import { buildActivityListQuery } from './activity-list-query.util'
import { ActivityResponse, formatActivity, PaginatedResponse, WeatherSummary } from './activity-response.util'
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
   * List activities for a route with optional filters and pagination.
   */
  async findAll(
    routeId: string,
    query: QueryActivityDto,
    userId: string,
  ): Promise<PaginatedResponse<ActivityResponse>> {
    const { page = 1, limit = 50 } = query

    // Verify route exists and belongs to user
    const route = await this.prisma.route.findUnique({ where: { id: routeId, userId } })
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`)
    }

    const { where, orderBy } = buildActivityListQuery(query, { routeId, userId })

    const all = await this.prisma.activity.findMany({
      where,
      orderBy,
    })

    const total = all.length
    const paginated = all.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((f) => formatActivity(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get a single activity of a route by ID.
   */
  async findOne(routeId: string, id: string, userId: string): Promise<ActivityResponse> {
    const activity = await this.prisma.activity.findUnique({ where: { id, userId, routeId } })

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`)
    }

    return formatActivity(activity)
  }

  /**
   * Create a new activity for a route.
   */
  async create(routeId: string, dto: CreateActivityDto, userId: string): Promise<ActivityResponse> {
    // Verify route exists and belongs to user
    const route = await this.prisma.route.findUnique({ where: { id: routeId, userId } })
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`)
    }

    // Fetch weather forecast for the ridden date
    const weather = await this.fetchWeatherForRide(route, dto.riddenAt)

    const activity = await this.prisma.activity.create({
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

    this.logger.log(`Created activity #${activity.id} for route "${route.name}"`)
    return formatActivity(activity)
  }

  /**
   * Update an activity of a route.
   */
  async update(routeId: string, id: string, dto: UpdateActivityDto, userId: string): Promise<ActivityResponse> {
    const existing = await this.prisma.activity.findUnique({ where: { id, userId, routeId } })
    if (!existing) {
      throw new NotFoundException(`Activity with ID ${id} not found`)
    }

    const activity = await this.prisma.activity.update({
      where: { id, userId, routeId },
      data: dto,
      include: { route: true },
    })

    this.logger.log(`Updated activity #${id}`)
    return formatActivity(activity)
  }

  /**
   * Delete an activity of a route.
   */
  async remove(routeId: string, id: string, userId: string): Promise<void> {
    const existing = await this.prisma.activity.findUnique({ where: { id, userId, routeId } })
    if (!existing) {
      throw new NotFoundException(`Activity with ID ${id} not found`)
    }

    await this.prisma.activity.delete({ where: { id, userId, routeId } })
    this.logger.log(`Deleted activity #${id}`)
  }

  /**
   * Get weather forecast for a route of the user on a specific date.
   */
  async getWeatherForecast(routeId: string, date: string, userId: string): Promise<WeatherSummary | null> {
    const route = await this.prisma.route.findUnique({ where: { id: routeId, userId } })
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
