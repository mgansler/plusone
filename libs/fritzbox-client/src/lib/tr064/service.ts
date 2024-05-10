import axios from 'axios'
import type { z } from 'zod'

import { xmlParser } from '../avm/shared'
import type { FritzBoxConfig } from '../config'

import type { argumentSchema, serviceSchema } from './schema'
import { scdpResponseSchema } from './schema'

export class Service {
  actions: Record<string, Array<z.infer<typeof argumentSchema>>> = {}

  constructor(
    private readonly config: FritzBoxConfig,
    private readonly service: z.infer<typeof serviceSchema>,
  ) {}

  async parseActions() {
    const resp = await axios.get(`http://${this.config.host}:49000${this.service.SCPDURL}`)

    const raw = xmlParser.parse(resp.data)

    try {
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
    } catch (e) {
      console.log(`could not parse for ${this.service.serviceType}`)
      console.log(e)
      console.log(raw.scpd.actionList.action)
    }
  }

  isOfServiceType(serviceType: string): boolean {
    return this.service.serviceType === serviceType
  }

  findAction(actionName: string) {
    return this.actions[actionName]
  }

  controlUrl(): string {
    return this.service.controlURL
  }
}
