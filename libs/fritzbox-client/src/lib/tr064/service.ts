import { Agent } from 'node:https'

import axios from 'axios'
import type { z } from 'zod'

import { xmlParser } from '../avm/shared'
import type { ServiceConfig } from '../config'

import type { ActionArgument, serviceSchema } from './schema'
import { scdpResponseSchema } from './schema'

export class Service {
  actions: Record<string, Array<ActionArgument>> = {}

  constructor(
    private readonly config: ServiceConfig,
    private readonly service: z.infer<typeof serviceSchema>,
  ) {}

  async parseActions() {
    const resp = await axios.get(`https://${this.config.host}:${this.config.port}${this.service.SCPDURL}`, {
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    })

    const raw = xmlParser.parse(resp.data)

    const parsed = scdpResponseSchema.parse(raw)

    this.actions = parsed.scpd.actionList.action.reduce(
      (previousValue, currentValue) => ({
        ...previousValue,
        [currentValue.name]: currentValue.argumentList
          ? Array.isArray(currentValue.argumentList.argument)
            ? currentValue.argumentList.argument
            : [currentValue.argumentList.argument]
          : [],
      }),
      this.actions,
    )
  }

  isOfServiceType(serviceType: string): boolean {
    return this.service.serviceType === serviceType
  }

  findAction(actionName: string): Array<ActionArgument> | undefined {
    return this.actions[actionName]
  }

  get controlUrl(): string {
    return this.service.controlURL
  }
}
