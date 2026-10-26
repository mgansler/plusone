import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

import { Prisma, PrismaService } from '@plusone/gpx-toolbox-persistence'

import { CreateFahrtDto, QueryFahrtDto, UpdateFahrtDto } from './dto/ride.dto'
import { parsePolyline } from './polyline.util'

/**
 * Weather forecast response for a route.
 */
type _WeatherForecast = {
  time: Array<Date>
  temperature2m: Array<number>
  rain: Array<number>
  windGusts10m: Array<number>
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
  async findAll(
    routeId: string,
    query: QueryFahrtDto,
    userId: string,
  ): Promise<{
    items: Array<any>
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { dateFrom, dateTo, sortBy = 'riddenAt', order = 'DESC', page = 1, limit = 50 } = query

    // Verify route exists and belongs to user
    const route = await this.prisma.route.findUnique({ where: { id: routeId, userId } })
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`)
    }

    const where: { routeId: string; riddenAt?: { gte?: Date; lte?: Date }; userId: string } = { routeId, userId }
    if (dateFrom || dateTo) {
      where.riddenAt = {}
      if (dateFrom) where.riddenAt.gte = new Date(dateFrom)
      if (dateTo) where.riddenAt.lte = new Date(dateTo)
    }

    const all = await this.prisma.fahrt.findMany({
      where,
      orderBy: { [sortBy]: order === 'ASC' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc },
    })

    const total = all.length
    const paginated = all.slice((page - 1) * limit, page * limit)

    return {
      items: paginated.map((f) => this.formatFahrt(f)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get a single Fahrt by ID.
   */
  async findOne(id: string, userId: string): Promise<any> {
    const fahrt = await this.prisma.fahrt.findUnique({ where: { id, userId } })

    if (!fahrt) {
      throw new NotFoundException(`Fahrt with ID ${id} not found`)
    }

    return this.formatFahrt(fahrt)
  }

  /**
   * Create a new Fahrt for a route.
   */
  async create(routeId: string, dto: CreateFahrtDto, userId: string): Promise<any> {
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
    return this.formatFahrt(fahrt)
  }

  /**
   * Update a Fahrt.
   */
  async update(id: string, dto: UpdateFahrtDto, userId: string): Promise<any> {
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
    return this.formatFahrt(fahrt)
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
  async getWeatherForecast(routeId: string, date: string): Promise<Record<string, any> | null> {
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

  private formatFahrt(fahrt: any): any {
    return {
      id: fahrt.id,
      routeId: fahrt.routeId,
      riddenAt: fahrt.riddenAt,
      duration: fahrt.duration,
      avgHr: fahrt.avgHr,
      maxHr: fahrt.maxHr,
      notes: fahrt.notes,
      weather: typeof fahrt.weather === 'string' ? JSON.parse(fahrt.weather) : fahrt.weather,
      createdAt: fahrt.createdAt,
      updatedAt: fahrt.updatedAt,
    }
  }

  /**
   * Fetch weather data for a ride date using Open-Meteo historical API.
   */
  private async fetchWeatherForRide(route: any, riddenAt: string): Promise<Record<string, any> | null> {
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
  ): Promise<Record<string, any> | null> {
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
        this.httpService.get(`https://api.open-meteo.com/v1/forecast?${params.toString()}`),
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
