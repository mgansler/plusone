import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

import { ActionRequestDto } from './action-request.dto'

export const commandRequestSchema = z.object({
  name: z.string().min(1),
  actions: z
    .array(
      z.object({
        macAddress: z.string(),
        on: z.boolean(),
        powerOnly: z.boolean(),
        hue: z.number().min(0).max(360).optional(),
        saturation: z.number().min(0).max(100).optional(),
        brightness: z.number().min(0).max(100).optional(),
      }),
    )
    .nonempty()
    .refine(
      (data) => {
        const macAddresses = new Set<string>()
        let hasNoDuplicates = true
        data.forEach(({ macAddress }) => {
          if (macAddresses.has(macAddress)) {
            hasNoDuplicates = false
          }
          macAddresses.add(macAddress)
        })
        return hasNoDuplicates
      },
      {
        error: 'actions contains duplicated macAddresses.',
      },
    ),
})

export class CommandRequestDto {
  @ApiProperty()
  name: string

  @ApiProperty({ type: () => [ActionRequestDto] })
  actions: Array<ActionRequestDto>
}
