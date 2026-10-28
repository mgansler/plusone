import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { QueryFahrtDto } from './dto/ride.dto'
import { buildFahrtListQuery } from './fahrt-list-query.util'

describe('buildFahrtListQuery', () => {
  it('sorts by ride date descending by default', () => {
    const { where, orderBy } = buildFahrtListQuery({}, { userId: 'u1' })
    expect(where).toEqual({ userId: 'u1' })
    expect(orderBy).toEqual([{ riddenAt: 'desc' }])
  })

  it('filters by date range', () => {
    const { where } = buildFahrtListQuery({ dateFrom: '2026-01-01', dateTo: '2026-12-31' }, { userId: 'u1' })
    expect(where.riddenAt).toEqual({ gte: new Date('2026-01-01'), lte: new Date('2026-12-31') })
  })

  it('filters by route distance and elevation gain', () => {
    const { where } = buildFahrtListQuery(
      { minDistance: 20_000, maxDistance: 50_000, minElevation: 500 },
      { userId: 'u1' },
    )
    expect(where.route).toEqual({ distance: { gte: 20_000, lte: 50_000 }, elevationGain: { gte: 500 } })
  })

  it('keeps 0 as a valid bound', () => {
    const { where } = buildFahrtListQuery({ minElevation: 0, maxElevation: 0 }, { userId: 'u1' })
    expect(where.route).toEqual({ elevationGain: { gte: 0, lte: 0 } })
  })

  it('sorts by route columns with nulls last and date as tie-breaker', () => {
    const { orderBy } = buildFahrtListQuery({ sortBy: 'elevationGain', order: 'ASC' }, { userId: 'u1' })
    expect(orderBy).toEqual([{ route: { elevationGain: { sort: 'asc', nulls: 'last' } } }, { riddenAt: 'desc' }])
  })

  it('sorts by nullable Fahrt columns with nulls last', () => {
    const { orderBy } = buildFahrtListQuery({ sortBy: 'duration' }, { userId: 'u1' })
    expect(orderBy).toEqual([{ duration: { sort: 'desc', nulls: 'last' } }, { riddenAt: 'desc' }])
  })
})

describe('QueryFahrtDto', () => {
  it('converts numeric query strings and treats empty strings as unset', async () => {
    const dto = plainToInstance(QueryFahrtDto, { minDistance: '20000', maxDistance: '', minElevation: '0' })
    expect(await validate(dto)).toEqual([])
    expect(dto.minDistance).toBe(20_000)
    expect(dto.maxDistance).toBeUndefined()
    expect(dto.minElevation).toBe(0)
  })

  it('accepts distance and elevationGain as sort field and rejects unknown ones', async () => {
    expect(await validate(plainToInstance(QueryFahrtDto, { sortBy: 'distance' }))).toEqual([])
    expect(await validate(plainToInstance(QueryFahrtDto, { sortBy: 'elevationGain' }))).toEqual([])
    expect(await validate(plainToInstance(QueryFahrtDto, { sortBy: 'name' }))).toHaveLength(1)
  })

  it('rejects negative distances', async () => {
    expect(await validate(plainToInstance(QueryFahrtDto, { minDistance: '-1' }))).toHaveLength(1)
  })
})
