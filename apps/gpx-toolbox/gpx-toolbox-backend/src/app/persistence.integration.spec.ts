import { NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'
import { parseGpx } from '@plusone/gpx-toolbox-utils'

import { createTestDatabase, TestDatabase } from '../test/test-database'

import { ActivitiesService } from './activities.service'
import { ImportService } from './import.service'
import { RidesService } from './rides.service'
import { RoutesService } from './routes.service'

const ALICE = 'user-alice'
const BOB = 'user-bob'

/** Build a GPX track along `[lat, lng, ele]` points, one point per minute */
function gpx(points: Array<[number, number, number]>, name = 'Track'): string {
  const start = Date.parse('2024-06-01T08:00:00Z')
  const trkpts = points
    .map(
      ([lat, lng, ele], i) =>
        `<trkpt lat="${lat}" lon="${lng}"><ele>${ele}</ele><time>${new Date(start + i * 60_000).toISOString()}</time></trkpt>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"><trk><name>${name}</name><trkseg>${trkpts}</trkseg></trk></gpx>`
}

/** Straight track of `count` points heading north-east from `[lat, lng]`, ~150 m per step */
function line(lat: number, lng: number, count = 20, climb = 5): Array<[number, number, number]> {
  return Array.from({ length: count }, (_, i) => [lat + i * 0.001, lng + i * 0.001, 300 + i * climb])
}

/**
 * Integration tests against a real SQLite database with all migrations applied. They cover what the
 * mocked unit tests cannot: that the `where` clauses really scope by user, the cascade on delete and
 * the SQL pre-filtering and sorting.
 */
describe('Persistence (SQLite integration)', () => {
  let db: TestDatabase
  let prisma: PrismaService
  let routes: RoutesService
  let activities: ActivitiesService
  let rides: RidesService
  let imports: ImportService
  const httpService = { get: vi.fn() }

  beforeAll(async () => {
    db = await createTestDatabase()
    prisma = db.prisma
    routes = new RoutesService(prisma)
    activities = new ActivitiesService(prisma)
    rides = new RidesService(prisma, httpService as unknown as HttpService)
    imports = new ImportService(prisma)
  })

  afterAll(async () => {
    await db?.close()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    await db.reset()
  })

  async function createRoute(userId: string, name: string, points = line(48.7, 9.1)) {
    const { id } = await routes.importGpx(gpx(points, name), { name, source: 'manualImport' }, userId)
    return id
  }

  async function createActivity(userId: string, routeId: string, data: Record<string, unknown> = {}) {
    return prisma.activity.create({ data: { routeId, userId, riddenAt: new Date('2024-06-01'), ...data } })
  }

  describe('tenant isolation', () => {
    let aliceRoute: string
    let aliceActivity: string

    beforeEach(async () => {
      aliceRoute = await createRoute(ALICE, 'Alice Runde')
      aliceActivity = (await createActivity(ALICE, aliceRoute, { title: 'Alice Fahrt' })).id
      await createRoute(BOB, 'Bob Runde')
    })

    it('lists only the routes of the user', async () => {
      const result = await routes.findAll({}, ALICE)

      expect(result.items.map((r) => r.name)).toEqual(['Alice Runde'])
    })

    it('does not let another user read, export, update or delete a route', async () => {
      await expect(routes.findById(aliceRoute, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(routes.exportGpx(aliceRoute, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(routes.update(aliceRoute, { name: 'gehackt' }, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(routes.remove(aliceRoute, BOB)).rejects.toBeInstanceOf(NotFoundException)

      const route = await routes.findById(aliceRoute, ALICE)
      expect(route.name).toBe('Alice Runde')
    })

    it('finds only nearby routes of the user', async () => {
      const result = await routes.findNearby(48.71, 9.11, 5, ALICE)

      expect(result.map((r) => r.name)).toEqual(['Alice Runde'])
    })

    it('does not let another user read, update or delete an activity', async () => {
      expect((await activities.findAll({}, BOB)).items).toEqual([])
      await expect(activities.findOne(aliceActivity, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(activities.update(aliceActivity, { notes: 'x' }, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(activities.remove(aliceActivity, BOB)).rejects.toBeInstanceOf(NotFoundException)

      const activity = await activities.findOne(aliceActivity, ALICE)
      expect(activity.notes).toBeNull()
    })

    it('does not let another user use a route for an activity or the weather', async () => {
      await expect(rides.findAll(aliceRoute, {}, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(rides.create(aliceRoute, { riddenAt: '2024-06-02' }, BOB)).rejects.toBeInstanceOf(NotFoundException)
      await expect(rides.getWeatherForecast(aliceRoute, '2024-06-01', BOB)).rejects.toBeInstanceOf(NotFoundException)
      expect(httpService.get).not.toHaveBeenCalled()
    })

    it('only finds an activity below the route it belongs to', async () => {
      const otherRoute = await createRoute(ALICE, 'Andere Runde')

      await expect(rides.findOne(otherRoute, aliceActivity, ALICE)).rejects.toBeInstanceOf(NotFoundException)
      await expect(rides.update(otherRoute, aliceActivity, { notes: 'x' }, ALICE)).rejects.toBeInstanceOf(
        NotFoundException,
      )
      await expect(rides.remove(otherRoute, aliceActivity, ALICE)).rejects.toBeInstanceOf(NotFoundException)
      expect((await rides.findOne(aliceRoute, aliceActivity, ALICE)).title).toBe('Alice Fahrt')
    })
  })

  describe('skipping duplicate route imports', () => {
    const track = line(48.7, 9.1)

    it('keeps a single route when the same GPX is imported again, but only per user', async () => {
      const first = await routes.importGpx(gpx(track, 'Runde'), { skipDuplicate: true }, ALICE)
      const again = await routes.importGpx(gpx(track, 'Runde'), { name: 'Anderer Name', skipDuplicate: true }, ALICE)
      const bob = await routes.importGpx(gpx(track, 'Runde'), { skipDuplicate: true }, BOB)

      expect(first.duplicate).toBe(false)
      expect(again).toMatchObject({ id: first.id, name: 'Runde', duplicate: true })
      expect(bob).toMatchObject({ duplicate: false })
      expect(bob.id).not.toBe(first.id)
      expect(await prisma.route.count({ where: { userId: ALICE } })).toBe(1)
      expect(await prisma.route.count({ where: { userId: BOB } })).toBe(1)
    })

    it('imports a route with the same name but a different track', async () => {
      await routes.importGpx(gpx(track, 'Runde'), { skipDuplicate: true }, ALICE)

      const other = await routes.importGpx(gpx(line(48.9, 9.3), 'Runde'), { skipDuplicate: true }, ALICE)

      expect(other.duplicate).toBe(false)
      expect(await prisma.route.count({ where: { userId: ALICE } })).toBe(2)
    })

    it('creates a copy when the option is not set', async () => {
      await routes.importGpx(gpx(track, 'Runde'), {}, ALICE)
      await routes.importGpx(gpx(track, 'Runde'), {}, ALICE)

      expect(await prisma.route.count({ where: { userId: ALICE } })).toBe(2)
    })
  })

  describe('updates', () => {
    it('updates a route and keeps the activities', async () => {
      const routeId = await createRoute(ALICE, 'Runde')
      await createActivity(ALICE, routeId)

      const updated = await routes.update(routeId, { name: 'Neue Runde', status: 'ridden', ratingTags: ['Top'] }, ALICE)

      expect(updated).toMatchObject({ name: 'Neue Runde', status: 'ridden', ratingTags: ['Top'] })
      expect(await prisma.activity.count({ where: { routeId } })).toBe(1)
    })

    it('updates an activity', async () => {
      const routeId = await createRoute(ALICE, 'Runde')
      const { id } = await createActivity(ALICE, routeId)

      const updated = await activities.update(id, { notes: 'Gegenwind', avgHr: 140 }, ALICE)

      expect(updated).toMatchObject({ notes: 'Gegenwind', avgHr: 140, routeName: 'Runde' })
    })
  })

  describe('deleting a route', () => {
    it('deletes its activities as well (onDelete: Cascade)', async () => {
      const routeId = await createRoute(ALICE, 'Runde')
      const keepId = await createRoute(ALICE, 'Bleibt')
      await createActivity(ALICE, routeId)
      await createActivity(ALICE, routeId)
      const kept = await createActivity(ALICE, keepId)

      await routes.remove(routeId, ALICE)

      expect(await prisma.route.findUnique({ where: { id: routeId } })).toBeNull()
      expect((await prisma.activity.findMany()).map((a) => a.id)).toEqual([kept.id])
    })
  })

  describe('route list', () => {
    beforeEach(async () => {
      await createRoute(ALICE, 'Kurz', line(48.7, 9.1, 5, 1))
      await createRoute(ALICE, 'Lang', line(48.7, 9.1, 40, 10))
      await createRoute(ALICE, 'Mittel', line(48.7, 9.1, 20, 2))
    })

    it('sorts by the denormalized distance column', async () => {
      const result = await routes.findAll({ sortBy: 'distance', order: 'ASC' }, ALICE)

      expect(result.items.map((r) => r.name)).toEqual(['Kurz', 'Mittel', 'Lang'])
    })

    it('sorts by name', async () => {
      const result = await routes.findAll({ sortBy: 'name', order: 'DESC' }, ALICE)

      expect(result.items.map((r) => r.name)).toEqual(['Mittel', 'Lang', 'Kurz'])
    })

    it('includes the activities of each route', async () => {
      const [route] = (await routes.findAll({ sortBy: 'name', order: 'ASC' }, ALICE)).items
      await createActivity(ALICE, route.id, { riddenAt: new Date('2024-05-01') })
      await createActivity(ALICE, route.id, { riddenAt: new Date('2024-07-01') })

      const result = await routes.findAll({ sortBy: 'name', order: 'ASC' }, ALICE)

      expect(result.items.map((r) => r.activities.length)).toEqual([2, 0, 0])
      expect(result.items[0].activities.map((a) => a.riddenAt)).toEqual([
        new Date('2024-07-01'),
        new Date('2024-05-01'),
      ])
    })

    it('filters by distance and paginates', async () => {
      const result = await routes.findAll({ minDistance: 1000, sortBy: 'distance', order: 'ASC', limit: 1 }, ALICE)

      expect(result.total).toBe(2)
      expect(result.items.map((r) => r.name)).toEqual(['Mittel'])
    })
  })

  describe('activity list', () => {
    beforeEach(async () => {
      const short = await createRoute(ALICE, 'Kurz', line(48.7, 9.1, 5, 1))
      const long = await createRoute(ALICE, 'Lang', line(48.7, 9.1, 40, 10))
      // A route without denormalized columns, e.g. imported before they existed
      const legacy = await prisma.route.create({
        data: {
          name: 'Alt',
          gpxContent: '',
          polyline: [],
          stats: {},
          ratingTags: [],
          source: 'manualImport',
          userId: ALICE,
        },
      })
      await createActivity(ALICE, short, { title: 'kurz', duration: 600, riddenAt: new Date('2024-06-03') })
      await createActivity(ALICE, long, { title: 'lang', duration: 7200, riddenAt: new Date('2024-06-01') })
      await createActivity(ALICE, legacy.id, { title: 'alt', duration: null, riddenAt: new Date('2024-06-02') })
    })

    it('sorts by ride date descending by default', async () => {
      const result = await activities.findAll({}, ALICE)

      expect(result.items.map((a) => a.title)).toEqual(['kurz', 'alt', 'lang'])
    })

    it.each([
      ['duration', 'ASC', ['kurz', 'lang', 'alt']],
      ['duration', 'DESC', ['lang', 'kurz', 'alt']],
      ['distance', 'ASC', ['kurz', 'lang', 'alt']],
      ['distance', 'DESC', ['lang', 'kurz', 'alt']],
    ] as const)('sorts by %s %s with empty values last', async (sortBy, order, expected) => {
      const result = await activities.findAll({ sortBy, order }, ALICE)

      expect(result.items.map((a) => a.title)).toEqual(expected)
    })

    it('filters by the distance of the route in SQL', async () => {
      const result = await activities.findAll({ minDistance: 1000 }, ALICE)

      expect(result.items.map((a) => a.title)).toEqual(['lang'])
    })

    it('filters by date range', async () => {
      const result = await activities.findAll({ dateFrom: '2024-06-02', dateTo: '2024-06-03' }, ALICE)

      expect(result.items.map((a) => a.title)).toEqual(['kurz', 'alt'])
    })
  })

  describe('matching an uploaded activity to a route', () => {
    const track = line(48.7, 9.1, 30)

    it('links the activity to a matching route of the user and marks it as ridden', async () => {
      const routeId = await createRoute(ALICE, 'Hausrunde', track)

      const result = await imports.importGpxActivity(gpx(track, 'Feierabend'), ALICE)

      expect(result).toEqual({ imported: 1, matched: 1, newRoutes: 0 })
      const activity = await prisma.activity.findFirstOrThrow({ where: { userId: ALICE } })
      expect(activity).toMatchObject({ routeId, title: 'Feierabend', duration: 29 * 60 })
      expect((await prisma.route.findUniqueOrThrow({ where: { id: routeId } })).status).toBe('ridden')
    })

    it('ignores matching routes of other users', async () => {
      const bobRoute = await createRoute(BOB, 'Bobs Runde', track)

      const result = await imports.importGpxActivity(gpx(track), ALICE)

      expect(result).toEqual({ imported: 1, matched: 0, newRoutes: 1 })
      const activity = await prisma.activity.findFirstOrThrow({ where: { userId: ALICE } })
      expect(activity.routeId).not.toBe(bobRoute)
      expect((await prisma.route.findUniqueOrThrow({ where: { id: bobRoute } })).status).toBe('planned')
    })

    it('pre-filters candidates by bounding box and distance in SQL', async () => {
      await createRoute(ALICE, 'Woanders', line(47.5, 8.5, 30))
      await createRoute(ALICE, 'Viel länger', line(48.7, 9.1, 80))
      const findMany = vi.spyOn(prisma.route, 'findMany')

      const match = await imports.findBestMatch(parseGpx(gpx(track)), ALICE)

      expect(match).toBeNull()
      // Neither candidate survives the SQL pre-filter, so no geometry comparison is needed
      await expect(findMany.mock.results[0].value).resolves.toEqual([])
      findMany.mockRestore()
    })

    it('reuses the route created by an earlier upload of the same track', async () => {
      await imports.importGpxActivity(gpx(track, 'Erste'), ALICE)

      const result = await imports.importGpxActivity(gpx(track, 'Zweite'), ALICE)

      expect(result).toEqual({ imported: 1, matched: 1, newRoutes: 0 })
      expect(await prisma.route.count({ where: { userId: ALICE } })).toBe(1)
      expect(await prisma.activity.count({ where: { userId: ALICE } })).toBe(2)
    })
  })
})
