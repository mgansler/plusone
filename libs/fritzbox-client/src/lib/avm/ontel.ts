import { Agent } from 'node:https'

import axios from 'axios'
import { z } from 'zod'

import type { Tr064 } from '../tr064/tr064'

import { dateTransformSchema, xmlParser } from './shared'

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
  Type: z.nativeEnum(CallType),
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

const getCallListSchema = z.object({
  root: z.object({
    timestamp: z.number(),
    Call: callSchema.or(z.array(callSchema)).transform((calls) => (Array.isArray(calls) ? calls : [calls])),
  }),
})

export type GetCallListResponse = z.infer<typeof getCallListSchema>

export class OnTelService {
  private ServiceType = 'urn:dslforum-org:service:X_AVM-DE_OnTel:1'

  constructor(private readonly tr064: Tr064) {}

  async getCallList(): Promise<GetCallListResponse> {
    const actionName = 'GetCallList'
    const rawResponse = await this.tr064.makeCall(this.ServiceType, actionName)
    const callUrl = rawResponse['s:Envelope']['s:Body'][`u:${actionName}Response`]['NewCallListURL']
    const response = await axios.get(callUrl, { httpsAgent: new Agent({ rejectUnauthorized: false }) })
    return getCallListSchema.parse(xmlParser.parse(response.data))
  }
}
