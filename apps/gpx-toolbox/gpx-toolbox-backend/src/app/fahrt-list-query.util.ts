import { Prisma } from '@plusone/gpx-toolbox-persistence'

import { FahrtSortField, QueryFahrtDto } from './dto/ride.dto'

/** Sort fields that live on the parent route instead of the Fahrt */
const ROUTE_SORT_FIELDS: ReadonlyArray<FahrtSortField> = ['distance', 'elevationGain']

/**
 * Translate the filter and sort options of `QueryFahrtDto` into a Prisma `where` / `orderBy`.
 * Distance and elevation filters/sorting use the denormalized columns of the parent route.
 */
export function buildFahrtListQuery(
  query: QueryFahrtDto,
  baseWhere: Prisma.FahrtWhereInput,
): { where: Prisma.FahrtWhereInput; orderBy: Array<Prisma.FahrtOrderByWithRelationInput> } {
  const { dateFrom, dateTo, minDistance, maxDistance, minElevation, maxElevation } = query
  const sortBy = query.sortBy ?? 'riddenAt'
  const direction = query.order === 'ASC' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc

  const where: Prisma.FahrtWhereInput = { ...baseWhere }
  if (dateFrom || dateTo) {
    where.riddenAt = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    }
  }

  const route: Prisma.RouteWhereInput = {}
  if (minDistance != null || maxDistance != null) {
    route.distance = {
      ...(minDistance != null && { gte: minDistance }),
      ...(maxDistance != null && { lte: maxDistance }),
    }
  }
  if (minElevation != null || maxElevation != null) {
    route.elevationGain = {
      ...(minElevation != null && { gte: minElevation }),
      ...(maxElevation != null && { lte: maxElevation }),
    }
  }
  if (Object.keys(route).length > 0) where.route = route

  // Fahrten without a value always go last; ties are ordered by date
  const primary: Prisma.FahrtOrderByWithRelationInput = ROUTE_SORT_FIELDS.includes(sortBy)
    ? { route: { [sortBy]: { sort: direction, nulls: 'last' } } }
    : sortBy === 'riddenAt' || sortBy === 'createdAt'
      ? { [sortBy]: direction }
      : { [sortBy]: { sort: direction, nulls: 'last' } }
  const orderBy = sortBy === 'riddenAt' ? [primary] : [primary, { riddenAt: Prisma.SortOrder.desc }]

  return { where, orderBy }
}
