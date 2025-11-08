import { PrismaPg } from '@prisma/adapter-pg'

export function createAdapter() {
  return new PrismaPg({ connectionString: process.env.FEEDS_DATABASE_URL })
}
