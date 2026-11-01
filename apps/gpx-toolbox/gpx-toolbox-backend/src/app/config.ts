import { z } from 'zod'

export const STRAVA_CLIENT_ID = 'STRAVA_CLIENT_ID'
export const STRAVA_CLIENT_SECRET = 'STRAVA_CLIENT_SECRET'
export const STRAVA_REDIRECT_URI = 'STRAVA_REDIRECT_URI'
export const JWT_SECRET = 'JWT_SECRET'
export const JWT_EXPIRES_IN = 'JWT_EXPIRES_IN'
export const FRONTEND_URL = 'FRONTEND_URL'
export const STRAVA_BASE_URL = 'STRAVA_BASE_URL'

const DEFAULT_STRAVA_BASE_URL = 'https://www.strava.com'

export const configSchema = z.object({
  [STRAVA_CLIENT_ID]: z.string(),
  [STRAVA_CLIENT_SECRET]: z.string(),
  [STRAVA_REDIRECT_URI]: z.url().default('http://localhost:3333/api/auth/strava/callback'),
  [JWT_SECRET]: z.string().default('change-me-in-production'),
  [JWT_EXPIRES_IN]: z.string().default('7d'),
  // Target of the redirect after the Strava OAuth callback (the web app)
  [FRONTEND_URL]: z.string().url().default('http://localhost:4250'),
  // Only overridden by the end-to-end tests, which run against a Strava mock server
  [STRAVA_BASE_URL]: z.url().default(DEFAULT_STRAVA_BASE_URL),
  GPX_TOOLBOX_DATABASE_URL: z.string().startsWith('file:'),
})

export type Config = z.infer<typeof configSchema>

/** Origin of Strava (OAuth and API) */
export function stravaBaseUrl(): string {
  return process.env[STRAVA_BASE_URL] || DEFAULT_STRAVA_BASE_URL
}
