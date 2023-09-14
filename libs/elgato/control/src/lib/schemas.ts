import { z } from 'zod'

export const lightStripControlStateSchema = z
  .object({
    on: z.number().int().min(0).max(1).optional(),
    hue: z.number().min(0).max(360).optional(),
    saturation: z.number().min(0).max(100).optional(),
    brightness: z.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      return Object.keys(data).filter((key) => typeof data[key] !== 'undefined').length > 0
    },
    { message: 'At least one property must be defined' },
  )

export type LightStripControlState = z.infer<typeof lightStripControlStateSchema>
