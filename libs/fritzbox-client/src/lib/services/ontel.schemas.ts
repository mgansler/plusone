import { z } from 'zod'

import { dateTransformSchema } from './shared'

export enum CallType {
  Incoming = 1,
  Missed = 2,
  Outgoing = 3,
  ActiveIncoming = 9,
  RejectedIncoming = 10,
  ActiveOutgoing = 11,
}

const callSchema = z.object({
  Id: z.number(),
  Type: z.enum(CallType),
  Caller: z.number().or(z.string()),
  Called: z.number().or(z.string()),
  Name: z.string(),
  Numbertype: z.string(),
  Device: z.string(),
  Port: z.number(),
  Date: dateTransformSchema,
  Duration: z.string(),
  Count: z.string(),
  Path: z.string(),
})

export const getCallListSchema = z.object({
  root: z.object({
    timestamp: z.number(),
    Call: callSchema.or(z.array(callSchema)).transform((calls) => (Array.isArray(calls) ? calls : [calls])),
  }),
})

export type GetCallListResponse = z.infer<typeof getCallListSchema>

const contactNumberSchema = z.object({
  '#text': z.number().or(z.string()),
  '@_type': z.string(),
  // '@_vanity': z.string(), // Undocumented property
  '@_prio': z.string(),
})

const contactSchema = z.object({
  category: z.number(),
  person: z.object({
    realName: z.string(),
  }),
  uniqueid: z.number(),
  telephony: z
    .object({
      services: z.string(),
      number: contactNumberSchema.or(z.array(contactNumberSchema)).transform((numbers) =>
        Array.isArray(numbers)
          ? numbers.map((number) => ({
              prio: number['@_prio'] === '' ? '0' : number['@_prio'],
              type: number['@_type'],
              value: number['#text'],
            }))
          : [
              {
                prio: numbers['@_prio'] === '' ? '0' : numbers['@_prio'],
                type: numbers['@_type'],
                value: numbers['#text'],
              },
            ],
      ),
    })
    .transform(({ number, ...rest }) => ({ ...rest, numbers: number })),
})

export const getPhonebookSchema = z.object({
  phonebooks: z.object({
    phonebook: z.object({
      timestamp: z.number(),
      contact: z.array(contactSchema),
    }),
  }),
})

export type GetPhonebookResponse = z.infer<typeof getPhonebookSchema>
