import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import Database from 'better-sqlite3'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

const MIGRATIONS_DIR = join(__dirname, '../../../../../libs/gpx-toolbox/persistence/migrations')

export type TestDatabase = {
  prisma: PrismaService
  /** Delete all rows, call between tests */
  reset: () => Promise<void>
  /** Disconnect and delete the database file */
  close: () => Promise<void>
}

/**
 * Create a fresh SQLite database in a temp directory with all migrations applied, and a
 * `PrismaService` connected to it. Used by the integration tests to run the real queries.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const dir = mkdtempSync(join(tmpdir(), 'gpx-toolbox-test-'))
  const file = join(dir, 'test.db')

  const db = new Database(file)
  for (const migration of readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()) {
    db.exec(readFileSync(join(MIGRATIONS_DIR, migration, 'migration.sql'), 'utf-8'))
  }
  db.close()

  // PrismaService reads the URL in its constructor
  process.env.GPX_TOOLBOX_DATABASE_URL = `file:${file}`
  const prisma = new PrismaService()
  await prisma.$connect()

  return {
    prisma,
    reset: async () => {
      await prisma.activity.deleteMany()
      await prisma.route.deleteMany()
      await prisma.user.deleteMany()
    },
    close: async () => {
      await prisma.$disconnect()
      rmSync(dir, { recursive: true, force: true })
    },
  }
}
