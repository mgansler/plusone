import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { QueryActivityDto } from './dto/activity.dto'
import { buildActivityListQuery } from './activity-list-query.util'

describe('buildActivityListQuery', () => {
  it('sorts by ride date descending by default', () => {
    const { where, orderBy } = buildActivityListQuery({}, { userId: 'u1' })
    expect(where).toEqual({ userId: 'u1' })
    expect(orderBy).toEqual([{ riddenAt: 'desc' }])
  })

  it('filters by date range', () => {
    const { where } = buildActivityListQuery({ dateFrom: '2026-01-01', dateTo: '2026-12-31' }, { userId: 'u1' })
    expect(where.riddenAt).toEqual({ gte: new Date('2026-01-01'), lte: new Date('2026-12-31') })
  })

  it('filters by route distance and elevation gain', () => {
    const { where } = buildActivityListQuery(
      { minDistance: 20_000, maxDistance: 50_000, minElevation: 500 },
      { userId: 'u1' },
    )
    expect(where.route).toEqual({ distance: { gte: 20_000, lte: 50_000 }, elevationGain: { gte: 500 } })
  })

  it('keeps 0 as a valid bound', () => {
    const { where } = buildActivityListQuery({ minElevation: 0, maxElevation: 0 }, { userId: 'u1' })
    expect(where.route).toEqual({ elevationGain: { gte: 0, lte: 0 } })
  })

  it('sorts by route columns with nulls last and date as tie-breaker', () => {
    const { orderBy } = buildActivityListQuery({ sortBy: 'elevationGain', order: 'ASC' }, { userId: 'u1' })
    expect(orderBy).toEqual([{ route: { elevationGain: { sort: 'asc', nulls: 'last' } } }, { riddenAt: 'desc' }])
  })

  it('sorts by nullable activity columns with nulls last', () => {
    const { orderBy } = buildActivityListQuery({ sortBy: 'duration' }, { userId: 'u1' })
    expect(orderBy).toEqual([{ duration: { sort: 'desc', nulls: 'last' } }, { riddenAt: 'desc' }])
  })
})

describe('QueryActivityDto', () => {
  it('converts numeric query strings and treats empty strings as unset', async () => {
    const dto = plainToInstance(QueryActivityDto, { minDistance: '20000', maxDistance: '', minElevation: '0' })
    expect(await validate(dto)).toEqual([])
    expect(dto.minDistance).toBe(20_000)
    expect(dto.maxDistance).toBeUndefined()
    expect(dto.minElevation).toBe(0)
  })

  it('accepts distance and elevationGain as sort field and rejects unknown ones', async () => {
    expect(await validate(plainToInstance(QueryActivityDto, { sortBy: 'distance' }))).toEqual([])
    expect(await validate(plainToInstance(QueryActivityDto, { sortBy: 'elevationGain' }))).toEqual([])
    expect(await validate(plainToInstance(QueryActivityDto, { sortBy: 'name' }))).toHaveLength(1)
  })

  it('rejects negative distances', async () => {
    expect(await validate(plainToInstance(QueryActivityDto, { minDistance: '-1' }))).toHaveLength(1)
  })
})
