import { z } from 'zod'

export const ADMIN_USERNAME = 'ADMIN_USERNAME'
export const ADMIN_PASSWORD = 'ADMIN_PASSWORD'
export const HOSTNAME = 'HOSTNAME'

export const configSchema = z.object({
  [ADMIN_USERNAME]: z.string().default('admin'),
  [ADMIN_PASSWORD]: z.string().optional(),
  [HOSTNAME]: z.string(),
})

export type ValidatedConfig = z.infer<typeof configSchema>
