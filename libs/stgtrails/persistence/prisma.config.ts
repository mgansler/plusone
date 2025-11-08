import { defineConfig, env } from 'prisma/config'

import type { PrismaEnv } from './src'
import { createAdapter } from './src/lib/create-adapter'

export default defineConfig({
  schema: './src/lib/schema.prisma',
  migrations: {
    path: './src/lib/migrations',
  },
  async adapter() {
    return createAdapter()
  },
  datasource: {
    url: env<PrismaEnv>('STGTRAILS_DATABASE_URL'),
  },
})
