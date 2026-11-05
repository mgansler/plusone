import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

import { CreateRouteDto, QueryRouteDto, UpdateRouteDto } from './dto/route.dto'
import { CreateActivityDto, QueryActivityDto } from './dto/activity.dto'
import { ImportResultDto } from './dto/import.dto'
import { NearbyRouteResponseDto } from './dto/nearby-route-response.dto'
import { ListRoutesResponseDto, RouteResponseDto } from './dto/list-routes-response.dto'
import { HealthCheckResultDto } from './dto/health.dto'

describe('CreateRouteDto', () => {
  it('accepts valid data', async () => {
    const dto = plainToInstance(CreateRouteDto, { name: 'Test Route', source: 'manualImport' })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('accepts missing name', async () => {
    const dto = plainToInstance(CreateRouteDto, {})
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('rejects empty name', async () => {
    const dto = plainToInstance(CreateRouteDto, { name: '' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects invalid source', async () => {
    const dto = plainToInstance(CreateRouteDto, { name: 'Test', source: 'invalid' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts all valid source values', async () => {
    for (const source of ['stravaRoute', 'stravaActivity', 'manualImport']) {
      const dto = plainToInstance(CreateRouteDto, { name: 'Test', source })
      const errors = await validate(dto)
      expect(errors.length).toBe(0)
    }
  })
})

describe('CreateRouteDto skipDuplicate', () => {
  it.each([
    ['true', true],
    ['false', false],
    [true, true],
  ])('accepts %s (a form field arrives as string) as %s', async (value, expected) => {
    const dto = plainToInstance(CreateRouteDto, { skipDuplicate: value })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
    expect(dto.skipDuplicate).toBe(expected)
  })

  it('is optional', async () => {
    const dto = plainToInstance(CreateRouteDto, { name: 'Test' })
    expect(await validate(dto)).toHaveLength(0)
    expect(dto.skipDuplicate).toBeUndefined()
  })

  it('rejects anything but a boolean', async () => {
    const dto = plainToInstance(CreateRouteDto, { skipDuplicate: 'maybe' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('UpdateRouteDto', () => {
  it('accepts empty object (all optional)', async () => {
    const dto = plainToInstance(UpdateRouteDto, {})
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('accepts valid name update', async () => {
    const dto = plainToInstance(UpdateRouteDto, { name: 'Updated Route' })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('rejects empty name', async () => {
    const dto = plainToInstance(UpdateRouteDto, { name: '' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts valid status', async () => {
    for (const status of ['planned', 'ridden', 'foundOnline']) {
      const dto = plainToInstance(UpdateRouteDto, { status })
      const errors = await validate(dto)
      expect(errors.length).toBe(0)
    }
  })

  it('rejects invalid status', async () => {
    const dto = plainToInstance(UpdateRouteDto, { status: 'invalid' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts rating tags', async () => {
    const dto = plainToInstance(UpdateRouteDto, { ratingTags: ['wet', 'busy'] })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })
})

describe('QueryRouteDto', () => {
  it('accepts empty query (all optional)', async () => {
    const dto = plainToInstance(QueryRouteDto, {})
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('accepts valid sort fields', async () => {
    for (const sortBy of ['name', 'distance', 'elevationGain', 'createdAt', 'updatedAt']) {
      const dto = plainToInstance(QueryRouteDto, { sortBy })
      const errors = await validate(dto)
      expect(errors.length).toBe(0)
    }
  })

  it('accepts valid order', async () => {
    for (const order of ['ASC', 'DESC']) {
      const dto = plainToInstance(QueryRouteDto, { order })
      const errors = await validate(dto)
      expect(errors.length).toBe(0)
    }
  })

  it('rejects unknown sort fields (they would end up in the Prisma orderBy)', async () => {
    const dto = plainToInstance(QueryRouteDto, { sortBy: 'invalid' })
    const errors = await validate(dto)
    expect(errors.length).toBe(1)
    expect(errors[0].property).toBe('sortBy')
  })

  it('accepts valid pagination', async () => {
    const dto = plainToInstance(QueryRouteDto, { page: 2, limit: 20 })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('rejects page below 1', async () => {
    const dto = plainToInstance(QueryRouteDto, { page: 0 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('clamps limit to 200 via Transform decorator', async () => {
    const dto = plainToInstance(QueryRouteDto, { limit: 201 })
    const errors = await validate(dto)
    // Transform clamps 201 → 200, so validation passes
    expect(errors.length).toBe(0)
    expect(dto.limit).toBe(200)
  })

  it('accepts valid distance filters', async () => {
    const dto = plainToInstance(QueryRouteDto, { minDistance: 1000, maxDistance: 50000 })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('accepts valid elevation filters', async () => {
    const dto = plainToInstance(QueryRouteDto, { minElevation: 0, maxElevation: 2000 })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })
})

describe('CreateActivityDto', () => {
  it('accepts valid data', async () => {
    const dto = plainToInstance(CreateActivityDto, {
      riddenAt: '2024-06-01T10:00:00Z',
      duration: 3600,
      avgHr: 150,
      maxHr: 170,
    })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('rejects missing riddenAt', async () => {
    const dto = plainToInstance(CreateActivityDto, {})
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects invalid date', async () => {
    const dto = plainToInstance(CreateActivityDto, { riddenAt: 'not-a-date' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects heart rate above 250', async () => {
    const dto = plainToInstance(CreateActivityDto, { riddenAt: '2024-06-01T10:00:00Z', avgHr: 300 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects negative duration', async () => {
    const dto = plainToInstance(CreateActivityDto, { riddenAt: '2024-06-01T10:00:00Z', duration: -1 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('QueryActivityDto', () => {
  it('accepts empty query', async () => {
    const dto = plainToInstance(QueryActivityDto, {})
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('accepts valid date range', async () => {
    const dto = plainToInstance(QueryActivityDto, { dateFrom: '2024-06-01', dateTo: '2024-06-30' })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('rejects invalid date', async () => {
    const dto = plainToInstance(QueryActivityDto, { dateFrom: 'not-a-date' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('DTO type shapes', () => {
  it('ImportResultDto has required fields', () => {
    const dto: ImportResultDto = { imported: 5, matched: 2, newRoutes: 3 }
    expect(dto.imported).toBe(5)
    expect(dto.matched).toBe(2)
    expect(dto.newRoutes).toBe(3)
  })

  it('HealthCheckResultDto has required fields', () => {
    const dto: HealthCheckResultDto = { status: 'ok', details: {} }
    expect(dto.status).toBe('ok')
    expect(dto.details).toEqual({})
  })

  it('RouteResponseDto has all expected fields', () => {
    const dto: RouteResponseDto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Route',
      description: null,
      source: 'manualImport',
      status: 'planned',
      ratingTags: [],
      notes: null,
      stats: { distance: 5000 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      polyline: [{ lat: 48.0, lng: 11.0 }],
    }
    expect(dto.id).toBeDefined()
    expect(dto.polyline).toEqual([{ lat: 48.0, lng: 11.0 }])
  })

  it('NearbyRouteResponseDto has all expected fields', () => {
    const dto: NearbyRouteResponseDto = {
      id: '550e8400',
      name: 'Nearby',
      distance: 1500,
      distanceKm: '1.50',
      status: 'planned',
      source: 'manualImport',
      stats: { distance: 5000 },
      polyline: [{ lat: 48.0, lng: 11.0 }],
    }
    expect(dto.distance).toBe(1500)
    expect(dto.distanceKm).toBe('1.50')
  })

  it('ListRoutesResponseDto has all expected fields', () => {
    const dto: ListRoutesResponseDto = {
      total: 10,
      page: 1,
      limit: 50,
      totalPages: 1,
      items: [],
    }
    expect(dto.total).toBe(10)
    expect(dto.items).toEqual([])
  })
})
