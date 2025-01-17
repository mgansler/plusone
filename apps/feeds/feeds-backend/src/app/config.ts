import { z } from 'zod'

export const PAGE_SIZE = 'PAGE_SIZE'
export const RECENTLY_READ_COUNT = 'RECENTLY_READ_COUNT'

// jwt
export const JWT_ACCESS_TOKEN_SECRET = 'JWT_ACCESS_TOKEN_SECRET'
export const JWT_ACCESS_TOKEN_EXPIRATION_TIME = 'JWT_ACCESS_TOKEN_EXPIRATION_TIME'
export const JWT_REFRESH_TOKEN_SECRET = 'JWT_REFRESH_TOKEN_SECRET'
export const JWT_REFRESH_TOKEN_EXPIRATION_TIME = 'JWT_REFRESH_TOKEN_EXPIRATION_TIME'

export const configSchema = z.object({
  ADMIN_USER: z.string(),
  ADMIN_PASSWORD: z.string(),
  [JWT_ACCESS_TOKEN_SECRET]: z.string(),
  [JWT_ACCESS_TOKEN_EXPIRATION_TIME]: z.string(),
  [JWT_REFRESH_TOKEN_SECRET]: z.string(),
  [JWT_REFRESH_TOKEN_EXPIRATION_TIME]: z.string(),
  FEEDS_DATABASE_URL: z.string(),
  [PAGE_SIZE]: z.number().default(20),
  [RECENTLY_READ_COUNT]: z.number().default(20),
})

export type Config = z.infer<typeof configSchema>
