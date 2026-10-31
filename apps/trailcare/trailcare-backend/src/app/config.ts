import { z } from 'zod'

export const TRAILCARE_ADMIN_PASSWORD = 'TRAILCARE_ADMIN_PASSWORD'
export const TRAILCARE_INITIAL_ACCESS_PASSWORD = 'TRAILCARE_INITIAL_ACCESS_PASSWORD'
export const TRAILCARE_SECURE_COOKIE = 'TRAILCARE_SECURE_COOKIE'
export const TRAILCARE_LOGIN_ATTEMPTS_PER_MINUTE = 'TRAILCARE_LOGIN_ATTEMPTS_PER_MINUTE'

export const configSchema = z.object({
  // Generated and logged on startup when missing
  [TRAILCARE_ADMIN_PASSWORD]: z.string().min(1).optional(),
  // Seeds the first access password for the public area if none exists yet
  [TRAILCARE_INITIAL_ACCESS_PASSWORD]: z.string().min(1).optional(),
  // Only send the session cookie via https; disable for local development over http
  [TRAILCARE_SECURE_COOKIE]: z.stringbool().default(true),
  // Login rate limit per client, raised for the e2e tests
  [TRAILCARE_LOGIN_ATTEMPTS_PER_MINUTE]: z.coerce.number().int().positive().default(10),
  TRAILCARE_DATABASE_URL: z.string().startsWith('file:'),
})

export type ValidatedConfig = z.infer<typeof configSchema>
