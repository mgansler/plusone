import { Prisma } from '@plusone/gpx-toolbox-persistence'

import { ActivitySortField, QueryActivityDto } from './dto/activity.dto'

/** Sort fields that live on the parent route instead of the activity */
const ROUTE_SORT_FIELDS: ReadonlyArray<ActivitySortField> = ['distance', 'elevationGain']

/**
 * Translate the filter and sort options of `QueryActivityDto` into a Prisma `where` / `orderBy`.
 * Distance and elevation filters/sorting use the denormalized columns of the parent route.
 */
export function buildActivityListQuery(
  query: QueryActivityDto,
  baseWhere: Prisma.ActivityWhereInput,
): { where: Prisma.ActivityWhereInput; orderBy: Array<Prisma.ActivityOrderByWithRelationInput> } {
  const { dateFrom, dateTo, minDistance, maxDistance, minElevation, maxElevation } = query
  const sortBy = query.sortBy ?? 'riddenAt'
  const direction = query.order === 'ASC' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc

  const where: Prisma.ActivityWhereInput = { ...baseWhere }
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

  // Activities without a value always go last; ties are ordered by date
  const primary: Prisma.ActivityOrderByWithRelationInput = ROUTE_SORT_FIELDS.includes(sortBy)
    ? { route: { [sortBy]: { sort: direction, nulls: 'last' } } }
    : sortBy === 'riddenAt' || sortBy === 'createdAt'
      ? { [sortBy]: direction }
      : { [sortBy]: { sort: direction, nulls: 'last' } }
  const orderBy = sortBy === 'riddenAt' ? [primary] : [primary, { riddenAt: Prisma.SortOrder.desc }]

  return { where, orderBy }
}
