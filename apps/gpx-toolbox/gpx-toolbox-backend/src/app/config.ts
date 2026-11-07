import { z } from 'zod'

export const JWT_SECRET = 'JWT_SECRET'
export const JWT_EXPIRES_IN = 'JWT_EXPIRES_IN'
export const FRONTEND_URL = 'FRONTEND_URL'
export const GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID'
export const GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET'
export const GOOGLE_REDIRECT_URI = 'GOOGLE_REDIRECT_URI'
export const GOOGLE_DISCOVERY_URL = 'GOOGLE_DISCOVERY_URL'

const DEFAULT_GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'

export const configSchema = z.object({
  [GOOGLE_CLIENT_ID]: z.string(),
  [GOOGLE_CLIENT_SECRET]: z.string(),
  [GOOGLE_REDIRECT_URI]: z.url().default('http://localhost:3333/api/auth/google/callback'),
  // Only overridden by the end-to-end tests, which run against a Google mock server
  [GOOGLE_DISCOVERY_URL]: z.url().default(DEFAULT_GOOGLE_DISCOVERY_URL),
  [JWT_SECRET]: z.string().default('change-me-in-production'),
  [JWT_EXPIRES_IN]: z.string().default('7d'),
  // Target of the redirect after the Google login (the web app)
  [FRONTEND_URL]: z.url().default('http://localhost:4250'),
  GPX_TOOLBOX_DATABASE_URL: z.string().startsWith('file:'),
})

export type Config = z.infer<typeof configSchema>

/** Read a required environment variable; fails loudly instead of sending "undefined" to an identity provider */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

/** OpenID Connect discovery document of Google */
export function googleDiscoveryUrl(): string {
  return process.env[GOOGLE_DISCOVERY_URL] || DEFAULT_GOOGLE_DISCOVERY_URL
}
