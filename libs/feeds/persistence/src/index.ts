export { PrismaService } from './lib/prisma.service'
export { PrismaModule } from './lib/prisma.module'
export * from './lib/client/client'

export type PrismaEnv = {
  FEEDS_DATABASE_URL: string
}
