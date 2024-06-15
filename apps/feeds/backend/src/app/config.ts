import { z } from 'zod'

import { PAGE_SIZE } from './consts'

export const configSchema = z.object({
  ADMIN_USER: z.string(),
  ADMIN_PASSWORD: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string(),
  FEEDS_DATABASE_URL: z.string(),
  [PAGE_SIZE]: z.number().default(20),
  RECENTLY_READ_COUNT: z.number().default(20),
})

export type Config = z.infer<typeof configSchema>
