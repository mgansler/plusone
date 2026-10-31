import { ConflictException, INestApplication } from '@nestjs/common'
import request from 'supertest'

import { AccessPasswordService } from './access-password.service'
import { AdminController } from './admin.controller'
import { AS_ADMIN, AS_USER, createControllerTestApp } from './controller-test-app'
import { TrailService } from './trail.service'

describe('AdminController', () => {
  let app: INestApplication
  const trailService = {
    createTrailArea: vi.fn(),
    updateTrailArea: vi.fn(),
    deleteTrailArea: vi.fn(),
    createTrail: vi.fn(),
    updateTrail: vi.fn(),
    deleteTrail: vi.fn(),
  }
  const accessPasswordService = {
    list: vi.fn(),
    create: vi.fn(),
    updateLabel: vi.fn(),
    rotate: vi.fn(),
    delete: vi.fn(),
  }

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [AdminController],
      providers: [
        { provide: TrailService, useValue: trailService },
        { provide: AccessPasswordService, useValue: accessPasswordService },
      ],
    })
  })

  afterAll(() => app.close())

  beforeEach(() => vi.resetAllMocks())

  describe('access control', () => {
    it.each([
      ['post', '/api/admin/trail-areas'],
      ['put', '/api/admin/trail-areas/1'],
      ['delete', '/api/admin/trail-areas/1'],
      ['post', '/api/admin/trail-areas/1/trails'],
      ['put', '/api/admin/trails/1'],
      ['delete', '/api/admin/trails/1'],
      ['get', '/api/admin/access-passwords'],
      ['post', '/api/admin/access-passwords'],
      ['put', '/api/admin/access-passwords/1'],
      ['post', '/api/admin/access-passwords/1/rotate'],
      ['delete', '/api/admin/access-passwords/1'],
    ] as const)('%s %s needs an admin session', async (method, url) => {
      await request(app.getHttpServer())[method](url).expect(401)
      await request(app.getHttpServer())[method](url).set('Cookie', AS_USER).expect(403)
    })
  })

  describe('trail areas', () => {
    it('creates an area with a trimmed name', async () => {
      trailService.createTrailArea.mockResolvedValue({ id: 1, name: 'Heslach' })

      await request(app.getHttpServer())
        .post('/api/admin/trail-areas')
        .set('Cookie', AS_ADMIN)
        .send({ name: '  Heslach ' })
        .expect(201, { id: 1, name: 'Heslach' })
      expect(trailService.createTrailArea).toHaveBeenCalledWith({ name: 'Heslach' })
    })

    it.each([{}, { name: '' }, { name: '   ' }, { name: 'x'.repeat(101) }])('rejects the name in %j', async (body) => {
      await request(app.getHttpServer()).post('/api/admin/trail-areas').set('Cookie', AS_ADMIN).send(body).expect(400)
      expect(trailService.createTrailArea).not.toHaveBeenCalled()
    })

    it('forwards conflicts', async () => {
      trailService.createTrailArea.mockRejectedValue(new ConflictException('gibt es schon'))

      const response = await request(app.getHttpServer())
        .post('/api/admin/trail-areas')
        .set('Cookie', AS_ADMIN)
        .send({ name: 'Heslach' })
        .expect(409)
      expect(response.body.message).toBe('gibt es schon')
    })

    it('renames and deletes areas', async () => {
      trailService.updateTrailArea.mockResolvedValue({ id: 2, name: 'Neu' })

      await request(app.getHttpServer())
        .put('/api/admin/trail-areas/2')
        .set('Cookie', AS_ADMIN)
        .send({ name: 'Neu' })
        .expect(200)
      expect(trailService.updateTrailArea).toHaveBeenCalledWith(2, { name: 'Neu' })

      await request(app.getHttpServer()).delete('/api/admin/trail-areas/2').set('Cookie', AS_ADMIN).expect(204)
      expect(trailService.deleteTrailArea).toHaveBeenCalledWith(2)
    })
  })

  describe('trails', () => {
    it('creates a trail with trimmed aliases', async () => {
      trailService.createTrail.mockResolvedValue({ id: 5 })

      await request(app.getHttpServer())
        .post('/api/admin/trail-areas/2/trails')
        .set('Cookie', AS_ADMIN)
        .send({ name: 'Jojo', aliases: [' Yoyo '], sweepGreenMaxDays: 1 })
        .expect(201)
      expect(trailService.createTrail).toHaveBeenCalledWith(2, {
        name: 'Jojo',
        aliases: ['Yoyo'],
        sweepGreenMaxDays: 1,
      })
    })

    it.each([
      ['aliases is no list', { name: 'Jojo', aliases: 'Yoyo' }],
      ['empty alias', { name: 'Jojo', aliases: ['  '] }],
      ['too many aliases', { name: 'Jojo', aliases: Array.from({ length: 21 }, (_, i) => `a${i}`) }],
      ['negative threshold', { name: 'Jojo', sweepGreenMaxDays: -1 }],
      ['fractional threshold', { name: 'Jojo', sweepYellowMaxDays: 1.5 }],
      ['threshold above a year', { name: 'Jojo', sweepYellowMaxDays: 366 }],
    ])('rejects %s', async (_, body) => {
      await request(app.getHttpServer())
        .post('/api/admin/trail-areas/2/trails')
        .set('Cookie', AS_ADMIN)
        .send(body)
        .expect(400)
      expect(trailService.createTrail).not.toHaveBeenCalled()
    })

    it('updates and deletes trails', async () => {
      trailService.updateTrail.mockResolvedValue({ id: 5 })

      await request(app.getHttpServer())
        .put('/api/admin/trails/5')
        .set('Cookie', AS_ADMIN)
        .send({ trailAreaId: 3, aliases: [] })
        .expect(200)
      expect(trailService.updateTrail).toHaveBeenCalledWith(5, { trailAreaId: 3, aliases: [] })

      await request(app.getHttpServer()).delete('/api/admin/trails/5').set('Cookie', AS_ADMIN).expect(204)
      expect(trailService.deleteTrail).toHaveBeenCalledWith(5)
    })
  })

  describe('access passwords', () => {
    it('lists passwords', async () => {
      accessPasswordService.list.mockResolvedValue([{ id: 1, label: 'Initial' }])
      await request(app.getHttpServer())
        .get('/api/admin/access-passwords')
        .set('Cookie', AS_ADMIN)
        .expect(200, [{ id: 1, label: 'Initial' }])
    })

    it('creates passwords with or without a chosen password', async () => {
      accessPasswordService.create.mockResolvedValue({ id: 2, label: 'Crew', password: 'abcd-efgh-jkmn' })

      await request(app.getHttpServer())
        .post('/api/admin/access-passwords')
        .set('Cookie', AS_ADMIN)
        .send({ label: ' Crew ' })
        .expect(201)
      expect(accessPasswordService.create).toHaveBeenCalledWith({ label: 'Crew' })

      await request(app.getHttpServer())
        .post('/api/admin/access-passwords')
        .set('Cookie', AS_ADMIN)
        .send({ label: 'Crew', password: 'geheim123' })
        .expect(201)
      expect(accessPasswordService.create).toHaveBeenLastCalledWith({ label: 'Crew', password: 'geheim123' })
    })

    it('rejects passwords shorter than 6 characters', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/access-passwords')
        .set('Cookie', AS_ADMIN)
        .send({ label: 'Crew', password: 'kurz' })
        .expect(400)
      await request(app.getHttpServer())
        .post('/api/admin/access-passwords/1/rotate')
        .set('Cookie', AS_ADMIN)
        .send({ password: 'kurz' })
        .expect(400)
      expect(accessPasswordService.create).not.toHaveBeenCalled()
      expect(accessPasswordService.rotate).not.toHaveBeenCalled()
    })

    it('renames, rotates and deletes passwords', async () => {
      accessPasswordService.updateLabel.mockResolvedValue({ id: 1 })
      accessPasswordService.rotate.mockResolvedValue({ id: 1, password: 'neu-neu-neu' })

      await request(app.getHttpServer())
        .put('/api/admin/access-passwords/1')
        .set('Cookie', AS_ADMIN)
        .send({ label: 'Crew Nord' })
        .expect(200)
      expect(accessPasswordService.updateLabel).toHaveBeenCalledWith(1, { label: 'Crew Nord' })

      await request(app.getHttpServer())
        .post('/api/admin/access-passwords/1/rotate')
        .set('Cookie', AS_ADMIN)
        .send({})
        .expect(200)
      expect(accessPasswordService.rotate).toHaveBeenCalledWith(1, {})

      await request(app.getHttpServer()).delete('/api/admin/access-passwords/1').set('Cookie', AS_ADMIN).expect(204)
      expect(accessPasswordService.delete).toHaveBeenCalledWith(1)
    })
  })
})
