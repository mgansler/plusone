import { ForbiddenException, INestApplication } from '@nestjs/common'
import request from 'supertest'

import { CareType } from '@plusone/trailcare-persistence'

import { CareController } from './care.controller'
import { CareService } from './care.service'
import { AS_ADMIN, AS_USER, ADMIN_SESSION, createControllerTestApp, USER_SESSION } from './controller-test-app'

describe('CareController', () => {
  let app: INestApplication
  const careService = { listEntries: vi.fn(), createEntry: vi.fn(), updateEntry: vi.fn(), deleteEntry: vi.fn() }

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [CareController],
      providers: [{ provide: CareService, useValue: careService }],
    })
  })

  afterAll(() => app.close())

  beforeEach(() => vi.resetAllMocks())

  describe('GET /api/trails/:trailId/care-entries', () => {
    it('lists the entries of the trail', async () => {
      careService.listEntries.mockResolvedValue([{ id: 1 }])

      await request(app.getHttpServer())
        .get('/api/trails/3/care-entries')
        .set('Cookie', AS_USER)
        .expect(200, [{ id: 1 }])
      expect(careService.listEntries).toHaveBeenCalledWith(3, USER_SESSION)
    })

    it('requires a session', async () => {
      await request(app.getHttpServer()).get('/api/trails/3/care-entries').expect(401)
    })
  })

  describe('POST /api/trails/:trailId/care-entries', () => {
    it('converts the date and strips unknown fields', async () => {
      careService.createEntry.mockResolvedValue({ id: 9 })

      await request(app.getHttpServer())
        .post('/api/trails/3/care-entries')
        .set('Cookie', AS_USER)
        .send({ type: 'SWEPT', performedAt: '2026-10-30T11:00:00.000Z', comment: 'Laub', createdBySessionId: 'x' })
        .expect(201, { id: 9 })

      expect(careService.createEntry).toHaveBeenCalledWith(
        3,
        { type: CareType.SWEPT, performedAt: new Date('2026-10-30T11:00:00.000Z'), comment: 'Laub' },
        USER_SESSION,
      )
    })

    it('accepts an entry without date', async () => {
      careService.createEntry.mockResolvedValue({ id: 9 })

      await request(app.getHttpServer())
        .post('/api/trails/3/care-entries')
        .set('Cookie', AS_USER)
        .send({ type: 'FALLEN_TREE' })
        .expect(201)
      expect(careService.createEntry).toHaveBeenCalledWith(3, { type: CareType.FALLEN_TREE }, USER_SESSION)
    })

    it.each([
      ['unknown type', { type: 'MOWED' }],
      ['missing type', {}],
      ['invalid date', { type: 'SWEPT', performedAt: 'gestern' }],
      ['too long comment', { type: 'SWEPT', comment: 'x'.repeat(1001) }],
      ['too long name', { type: 'SWEPT', performedBy: 'x'.repeat(101) }],
    ])('rejects %s', async (_, body) => {
      await request(app.getHttpServer())
        .post('/api/trails/3/care-entries')
        .set('Cookie', AS_USER)
        .send(body)
        .expect(400)
      expect(careService.createEntry).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/care-entries/:entryId', () => {
    it('is reserved for admins', async () => {
      await request(app.getHttpServer())
        .put('/api/care-entries/5')
        .set('Cookie', AS_USER)
        .send({ comment: 'x' })
        .expect(403)
      expect(careService.updateEntry).not.toHaveBeenCalled()
    })

    it('updates the entry as admin', async () => {
      careService.updateEntry.mockResolvedValue({ id: 5 })

      await request(app.getHttpServer())
        .put('/api/care-entries/5')
        .set('Cookie', AS_ADMIN)
        .send({ type: 'REPAIR', comment: '' })
        .expect(200, { id: 5 })
      expect(careService.updateEntry).toHaveBeenCalledWith(5, { type: CareType.REPAIR, comment: '' }, ADMIN_SESSION)
    })
  })

  describe('DELETE /api/care-entries/:entryId', () => {
    it('lets the service decide whether a user may undo', async () => {
      careService.deleteEntry.mockResolvedValue(undefined)

      await request(app.getHttpServer()).delete('/api/care-entries/5').set('Cookie', AS_USER).expect(204)
      expect(careService.deleteEntry).toHaveBeenCalledWith(5, USER_SESSION)
    })

    it('forwards a refused undo', async () => {
      careService.deleteEntry.mockRejectedValue(new ForbiddenException())
      await request(app.getHttpServer()).delete('/api/care-entries/5').set('Cookie', AS_USER).expect(403)
    })
  })
})
