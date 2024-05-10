import type { z } from 'zod'

import type { FritzBoxConfig } from '../config'

import type { deviceSchema } from './schema'
import { Service } from './service'

export class Device {
  private services: Array<Service> = []

  constructor(
    private readonly config: FritzBoxConfig,
    private readonly device: z.infer<typeof deviceSchema>,
  ) {}

  public async parseServices() {
    for (const service of this.device.serviceList.service) {
      const s = new Service(this.config, service)
      await s.parseActions()
      this.services.push(s)
    }
  }

  public findServiceByType(serviceType: string): Service | undefined {
    return this.services.find((service) => service.isOfServiceType(serviceType))
  }
}
