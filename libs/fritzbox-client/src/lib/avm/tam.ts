import { Agent } from 'node:https'

import axios from 'axios'
import { z } from 'zod'

import type { Tr064 } from '../tr064/tr064'

import { dateTransformSchema, xmlParser } from './shared'

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

const getMessageListSchema = z.object({
  Root: z.object({
    Message: messageSchema
      .or(z.array(messageSchema))
      .transform((messages) => (Array.isArray(messages) ? messages : [messages])),
  }),
})

export type GetMessageListResponse = z.infer<typeof getMessageListSchema>

export class TamService {
  private ServiceType = 'urn:dslforum-org:service:X_AVM-DE_TAM:1'

  constructor(private readonly tr064: Tr064) {}

  async getMessageList(): Promise<GetMessageListResponse> {
    const actionName = 'GetMessageList'
    const rawResponse = await this.tr064.makeCall(this.ServiceType, actionName, {
      NewIndex: '0',
    })
    const callUrl = rawResponse['s:Envelope']['s:Body'][`u:${actionName}Response`]['NewURL']
    const response = await axios.get(callUrl, { httpsAgent: new Agent({ rejectUnauthorized: false }) })
    return getMessageListSchema.parse(xmlParser.parse(response.data))
  }
}
