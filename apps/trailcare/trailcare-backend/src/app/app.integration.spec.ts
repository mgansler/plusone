import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ThrottlerGuard } from '@nestjs/throttler'
import request from 'supertest'

import { PrismaService } from '@plusone/trailcare-persistence'

import { TRAILCARE_ADMIN_PASSWORD, TRAILCARE_INITIAL_ACCESS_PASSWORD } from './config'

const ADMIN_PASSWORD = 'admin-secret'
const USER_PASSWORD = 'user-secret'

/** Session id as stored in the database for a `name=token` cookie */
const hashToken = (cookie: string) => createHash('sha256').update(cookie.split('=')[1]).digest('hex')

/** Runs the whole app against a fresh SQLite database, migrated like in production */
describe('Trailcare API', () => {
  let app: INestApplication
  let directory: string

  beforeAll(async () => {
    directory = mkdtempSync(join(tmpdir(), 'trailcare-'))
    process.env.TRAILCARE_DATABASE_URL = `file:${join(directory, 'trailcare.db')}`
    process.env[TRAILCARE_ADMIN_PASSWORD] = ADMIN_PASSWORD
    process.env[TRAILCARE_INITIAL_ACCESS_PASSWORD] = USER_PASSWORD

    const workspaceRoot = resolve(__dirname, '../../../../..')
    execSync('yarn prisma --config libs/trailcare/persistence/prisma.config.ts migrate deploy', {
      cwd: workspaceRoot,
      env: process.env,
      stdio: 'ignore',
    })

    // Import after the environment is prepared, the config is validated on import
    const { AppModule } = await import('./app.module')
    // The login rate limit would trip over the many logins in these tests
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile()
    app = module.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    await app.init()
  }, 60_000)

  afterAll(async () => {
    await app?.close()
    rmSync(directory, { recursive: true, force: true })
  })

  async function login(password: string): Promise<string> {
    const response = await request(app.getHttpServer()).post('/api/auth/login').send({ password }).expect(200)
    const cookie = response.headers['set-cookie']?.[0]
    expect(cookie).toContain('HttpOnly')
    return cookie.split(';')[0]
  }

  it('rejects requests without a session and wrong passwords', async () => {
    await request(app.getHttpServer()).get('/api/trail-areas').expect(401)
    await request(app.getHttpServer()).post('/api/auth/login').send({ password: 'nope' }).expect(401)
    await request(app.getHttpServer()).get('/api/health').expect(200)
    await request(app.getHttpServer()).get('/api/auth/session').expect(200, { authenticated: false })
  })

  it('separates user and admin access', async () => {
    const user = await login(USER_PASSWORD)
    const admin = await login(ADMIN_PASSWORD)

    await request(app.getHttpServer()).get('/api/auth/session').set('Cookie', user).expect(200, {
      authenticated: true,
      role: 'USER',
    })
    await request(app.getHttpServer()).get('/api/trail-areas').set('Cookie', user).expect(200)
    await request(app.getHttpServer())
      .post('/api/admin/trail-areas')
      .set('Cookie', user)
      .send({ name: 'x' })
      .expect(403)
    await request(app.getHttpServer()).get('/api/admin/access-passwords').set('Cookie', admin).expect(200)
  })

  it('manages trails and the care log including undo', async () => {
    const admin = await login(ADMIN_PASSWORD)
    const user = await login(USER_PASSWORD)
    const otherUser = await login(USER_PASSWORD)

    const area = await request(app.getHttpServer())
      .post('/api/admin/trail-areas')
      .set('Cookie', admin)
      .send({ name: ' Heslach ' })
      .expect(201)
    expect(area.body.name).toBe('Heslach')

    const trail = await request(app.getHttpServer())
      .post(`/api/admin/trail-areas/${area.body.id}/trails`)
      .set('Cookie', admin)
      .send({ name: 'Klabuster', aliases: ['Klabi', 'klabuster', 'Klabi'] })
      .expect(201)
    expect(trail.body).toMatchObject({ aliases: ['Klabi'], sweepStatus: 'RED', sweepGreenMaxDays: 2 })

    await request(app.getHttpServer())
      .put(`/api/admin/trails/${trail.body.id}`)
      .set('Cookie', admin)
      .send({ sweepGreenMaxDays: 5, sweepYellowMaxDays: 3 })
      .expect(400)

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const swept = await request(app.getHttpServer())
      .post(`/api/trails/${trail.body.id}/care-entries`)
      .set('Cookie', user)
      .send({ type: 'SWEPT', performedAt: yesterday.toISOString(), comment: '  ' })
      .expect(201)
    expect(swept.body.undoableUntil).toBeDefined()
    expect(swept.body.comment).toBeUndefined()

    const status = await request(app.getHttpServer())
      .get(`/api/trails/${trail.body.id}`)
      .set('Cookie', user)
      .expect(200)
    expect(status.body).toMatchObject({ sweepStatus: 'GREEN', daysSinceSwept: 1 })

    await request(app.getHttpServer())
      .post(`/api/trails/${trail.body.id}/care-entries`)
      .set('Cookie', user)
      .send({ type: 'SWEPT', performedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
      .expect(400)

    // Only the creator may undo, admins may always delete
    await request(app.getHttpServer()).delete(`/api/care-entries/${swept.body.id}`).set('Cookie', otherUser).expect(403)
    await request(app.getHttpServer()).delete(`/api/care-entries/${swept.body.id}`).set('Cookie', user).expect(204)

    const tree = await request(app.getHttpServer())
      .post(`/api/trails/${trail.body.id}/care-entries`)
      .set('Cookie', user)
      .send({ type: 'FALLEN_TREE', performedBy: 'Mia' })
      .expect(201)
    await request(app.getHttpServer())
      .put(`/api/care-entries/${tree.body.id}`)
      .set('Cookie', user)
      .send({ comment: 'x' })
      .expect(403)
    const edited = await request(app.getHttpServer())
      .put(`/api/care-entries/${tree.body.id}`)
      .set('Cookie', admin)
      .send({ comment: 'Liegt quer nach dem Drop', performedBy: '' })
      .expect(200)
    expect(edited.body).toMatchObject({ comment: 'Liegt quer nach dem Drop', type: 'FALLEN_TREE' })
    expect(edited.body.performedBy).toBeUndefined()

    const log = await request(app.getHttpServer())
      .get(`/api/trails/${trail.body.id}/care-entries`)
      .set('Cookie', user)
      .expect(200)
    expect(log.body).toHaveLength(1)

    await request(app.getHttpServer()).delete(`/api/admin/trail-areas/${area.body.id}`).set('Cookie', admin).expect(204)
    await request(app.getHttpServer()).get(`/api/trails/${trail.body.id}`).set('Cookie', user).expect(404)
  })

  it('logs out all devices of a rotated access password', async () => {
    const admin = await login(ADMIN_PASSWORD)

    const created = await request(app.getHttpServer())
      .post('/api/admin/access-passwords')
      .set('Cookie', admin)
      .send({ label: 'Crew Süd' })
      .expect(201)
    expect(created.body.password).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/)

    const crew = await login(created.body.password)
    const initial = await login(USER_PASSWORD)

    const rotated = await request(app.getHttpServer())
      .post(`/api/admin/access-passwords/${created.body.id}/rotate`)
      .set('Cookie', admin)
      .send({ password: 'new-crew-password' })
      .expect(200)
    expect(rotated.body.password).toBe('new-crew-password')

    await request(app.getHttpServer()).get('/api/trail-areas').set('Cookie', crew).expect(401)
    await request(app.getHttpServer()).get('/api/trail-areas').set('Cookie', initial).expect(200)
    await request(app.getHttpServer()).post('/api/auth/login').send({ password: created.body.password }).expect(401)
    await login('new-crew-password')

    const list = await request(app.getHttpServer()).get('/api/admin/access-passwords').set('Cookie', admin).expect(200)
    expect(list.body).toEqual([
      expect.objectContaining({ label: 'Initial' }),
      expect.objectContaining({ label: 'Crew Süd', activeSessions: 1 }),
    ])
    expect(list.body[0]).not.toHaveProperty('passwordHash')
  })

  it('ends the session on logout', async () => {
    const user = await login(USER_PASSWORD)
    await request(app.getHttpServer()).post('/api/auth/logout').set('Cookie', user).expect(200)
    await request(app.getHttpServer()).get('/api/trail-areas').set('Cookie', user).expect(401)
  })

  describe('edge cases', () => {
    let admin: string
    let user: string
    let prisma: PrismaService

    const api = () => request(app.getHttpServer())

    beforeAll(async () => {
      prisma = app.get(PrismaService)
      admin = await login(ADMIN_PASSWORD)
      user = await login(USER_PASSWORD)
    })

    async function createArea(name: string): Promise<number> {
      return (await api().post('/api/admin/trail-areas').set('Cookie', admin).send({ name }).expect(201)).body.id
    }

    async function createTrail(trailAreaId: number, name: string, extra = {}) {
      return (
        await api()
          .post(`/api/admin/trail-areas/${trailAreaId}/trails`)
          .set('Cookie', admin)
          .send({ name, ...extra })
          .expect(201)
      ).body
    }

    it('rejects expired sessions and unknown tokens', async () => {
      const expiring = await login(USER_PASSWORD)
      await prisma.session.update({
        where: { id: hashToken(expiring) },
        data: { expiresAt: new Date(Date.now() - 1) },
      })

      await api().get('/api/trail-areas').set('Cookie', expiring).expect(401)
      await api().get('/api/auth/session').set('Cookie', expiring).expect(200, { authenticated: false })
      await api().get('/api/trail-areas').set('Cookie', 'trailcare_session=made-up').expect(401)
    })

    it('stores only a hash of the session token', async () => {
      const cookie = await login(USER_PASSWORD)
      expect(await prisma.session.findUnique({ where: { id: cookie.split('=')[1] } })).toBeNull()
      expect(await prisma.session.findUnique({ where: { id: hashToken(cookie) } })).not.toBeNull()
    })

    it('requires a session for admin endpoints before checking the role', async () => {
      await api().get('/api/admin/access-passwords').expect(401)
      await api().get('/api/admin/access-passwords').set('Cookie', user).expect(403)
    })

    it('rejects duplicate names with a conflict', async () => {
      const areaId = await createArea('Birkenkopf')
      await api().post('/api/admin/trail-areas').set('Cookie', admin).send({ name: 'Birkenkopf' }).expect(409)

      await createTrail(areaId, 'Mogli')
      await api()
        .post(`/api/admin/trail-areas/${areaId}/trails`)
        .set('Cookie', admin)
        .send({ name: 'Mogli' })
        .expect(409)

      // Same trail name in another area is fine
      await createTrail(await createArea('Birkenkopf Süd'), 'Mogli')
    })

    it('moves trails, renames them and replaces their aliases', async () => {
      const from = await createArea('Kräherwald')
      const to = await createArea('Kräherwald Nord')
      const trail = await createTrail(from, 'Wurzelpfad', { aliases: ['Wurzel', 'WP'] })

      const updated = await api()
        .put(`/api/admin/trails/${trail.id}`)
        .set('Cookie', admin)
        .send({ trailAreaId: to, name: 'Wurzelweg', aliases: ['Wurzelpfad', 'Wurzelweg'] })
        .expect(200)

      // The new name is dropped from the aliases, the old name stays findable
      expect(updated.body).toMatchObject({
        name: 'Wurzelweg',
        trailAreaId: to,
        trailAreaName: 'Kräherwald Nord',
        aliases: ['Wurzelpfad'],
      })

      const unchanged = await api()
        .put(`/api/admin/trails/${trail.id}`)
        .set('Cookie', admin)
        .send({ sweepGreenMaxDays: 0 })
        .expect(200)
      expect(unchanged.body.aliases).toEqual(['Wurzelpfad'])
    })

    it('returns 404 for unknown trails and entries', async () => {
      await api().get('/api/trails/99999').set('Cookie', user).expect(404)
      await api().get('/api/trails/99999/care-entries').set('Cookie', user).expect(404)
      await api().post('/api/trails/99999/care-entries').set('Cookie', user).send({ type: 'SWEPT' }).expect(404)
      await api().delete('/api/care-entries/99999').set('Cookie', admin).expect(404)
      await api().put('/api/admin/trails/99999').set('Cookie', admin).send({ name: 'x' }).expect(404)
      await api().delete('/api/admin/trail-areas/99999').set('Cookie', admin).expect(404)
    })

    it('validates input', async () => {
      const trail = await createTrail(await createArea('Validierung'), 'Testtrail')

      await api().post(`/api/trails/${trail.id}/care-entries`).set('Cookie', user).send({ type: 'MOWED' }).expect(400)
      await api()
        .post(`/api/trails/${trail.id}/care-entries`)
        .set('Cookie', user)
        .send({ type: 'SWEPT', performedAt: 'gestern' })
        .expect(400)
      await api().post('/api/admin/trail-areas').set('Cookie', admin).send({ name: '   ' }).expect(400)
      await api().put(`/api/admin/trails/${trail.id}`).set('Cookie', admin).send({ sweepGreenMaxDays: -1 }).expect(400)
      await api().get('/api/trails/abc').set('Cookie', user).expect(400)

      // Unknown fields are stripped instead of reaching the database
      const entry = await api()
        .post(`/api/trails/${trail.id}/care-entries`)
        .set('Cookie', user)
        .send({ type: 'SWEPT', createdBySessionId: 'someone-else', trailId: 1 })
        .expect(201)
      expect(entry.body.trailId).toBe(trail.id)
      expect(entry.body.undoableUntil).toBeDefined()
    })

    it('refuses undo after the undo window, admins may still delete', async () => {
      const trail = await createTrail(await createArea('Undo'), 'Spät')
      const entry = await api()
        .post(`/api/trails/${trail.id}/care-entries`)
        .set('Cookie', user)
        .send({ type: 'SWEPT' })
        .expect(201)

      await prisma.careEntry.update({
        where: { id: entry.body.id },
        data: { createdAt: new Date(Date.now() - 60_000) },
      })

      const log = await api().get(`/api/trails/${trail.id}/care-entries`).set('Cookie', user).expect(200)
      expect(log.body[0].undoableUntil).toBeUndefined()

      await api().delete(`/api/care-entries/${entry.body.id}`).set('Cookie', user).expect(403)
      await api().delete(`/api/care-entries/${entry.body.id}`).set('Cookie', admin).expect(204)
    })

    it('bases the traffic light on sweeps only and reports the latest entry', async () => {
      const areaId = await createArea('Ampel')
      const trail = await createTrail(areaId, 'Ampeltrail')
      const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      for (const [type, performedAt] of [
        ['SWEPT', daysAgo(6)],
        ['SWEPT', daysAgo(3)],
        ['INSPECTION', daysAgo(0)],
      ]) {
        await api()
          .post(`/api/trails/${trail.id}/care-entries`)
          .set('Cookie', user)
          .send({ type, performedAt })
          .expect(201)
      }

      const areas = await api().get('/api/trail-areas').set('Cookie', user).expect(200)
      const listed = areas.body.find((area: { id: number }) => area.id === areaId).trails[0]
      expect(listed).toMatchObject({
        sweepStatus: 'YELLOW',
        daysSinceSwept: 3,
        lastCareEntry: { type: 'INSPECTION' },
      })

      // Lower thresholds turn the same trail red
      const updated = await api()
        .put(`/api/admin/trails/${trail.id}`)
        .set('Cookie', admin)
        .send({ sweepGreenMaxDays: 1, sweepYellowMaxDays: 2 })
        .expect(200)
      expect(updated.body.sweepStatus).toBe('RED')
    })

    it('admins can change type and date of an entry but not into the future', async () => {
      const trail = await createTrail(await createArea('Bearbeiten'), 'Editierbar')
      const entry = await api()
        .post(`/api/trails/${trail.id}/care-entries`)
        .set('Cookie', user)
        .send({ type: 'SWEPT', comment: 'Laub' })
        .expect(201)

      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      const updated = await api()
        .put(`/api/care-entries/${entry.body.id}`)
        .set('Cookie', admin)
        .send({ type: 'CUT_BACK', performedAt: twoDaysAgo })
        .expect(200)
      expect(updated.body).toMatchObject({ type: 'CUT_BACK', performedAt: twoDaysAgo, comment: 'Laub' })

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      await api()
        .put(`/api/care-entries/${entry.body.id}`)
        .set('Cookie', admin)
        .send({ performedAt: tomorrow })
        .expect(400)
    })

    it('deleting an access password logs out its devices and only it', async () => {
      const created = await api()
        .post('/api/admin/access-passwords')
        .set('Cookie', admin)
        .send({ label: 'Gäste', password: 'gast-passwort' })
        .expect(201)
      const guest = await login('gast-passwort')

      await api()
        .put(`/api/admin/access-passwords/${created.body.id}`)
        .set('Cookie', admin)
        .send({ label: 'Gäste 2026' })
        .expect(200)
      await api().delete(`/api/admin/access-passwords/${created.body.id}`).set('Cookie', admin).expect(204)

      await api().get('/api/trail-areas').set('Cookie', guest).expect(401)
      await api().get('/api/trail-areas').set('Cookie', user).expect(200)
      await api().post('/api/auth/login').send({ password: 'gast-passwort' }).expect(401)
      await api()
        .post('/api/admin/access-passwords')
        .set('Cookie', admin)
        .send({ label: 'x', password: 'kurz' })
        .expect(400)
    })
  })
})
