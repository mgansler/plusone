export { PrismaService } from './lib/prisma.service'
export { PrismaModule } from './lib/prisma.module'
export * from './lib/client/client'

export type PrismaEnv = {
  TRAILCARE_DATABASE_URL: string
}
