import { z } from 'zod'

import { dateTransformSchema } from './shared'

const messageSchema = z
  .object({
    Index: z.number(),
    Tam: z.number(),
    Called: z.number(),
    Date: dateTransformSchema,
    Duration: z.string(),
    Inbook: z.number().transform((value) => value === 1),
    Name: z.string(),
    New: z.number().transform((value) => value === 1),
    Path: z.string(),
  })
  .transform(({ Inbook, ...rest }) => ({
    ...rest,
    inBook: Inbook,
  }))

export const getMessageListSchema = z.object({
  Root: z.object({
    Message: messageSchema
      .or(z.array(messageSchema))
      .transform((messages) => (Array.isArray(messages) ? messages : [messages])),
  }),
})

export type GetMessageListResponse = z.infer<typeof getMessageListSchema>
