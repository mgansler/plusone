import { defineConfig, env } from 'prisma/config'

import type { PrismaEnv } from './src'

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: env<PrismaEnv>('STGTRAILS_DATABASE_URL'),
  },
})
