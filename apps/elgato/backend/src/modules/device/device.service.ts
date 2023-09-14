import { Injectable, Logger } from '@nestjs/common'
import Bonjour from 'bonjour-service'

import { PrismaService } from '@plusone/elgato-persistence'

@Injectable()
export class DeviceService {
  private logger = new Logger(DeviceService.name)

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    const knownDevices = await this.prismaService.device.count()
    this.logger.log(`Known devices: ${knownDevices}`)

    const bonjour = new Bonjour()
    bonjour.find({ type: 'elg' }, async (service) => {
      this.logger.debug(`Got a response from a device: ${service.name}.`)
      await this.prismaService.device.upsert({
        where: {
          id: service.txt.id,
        },
        create: {
          id: service.txt.id,
          name: service.name,
          fqdn: service.fqdn,
          host: service.host,
          port: service.port,
        },
        update: {
          fqdn: service.fqdn,
          host: service.host,
          port: service.port,
        },
      })
    })
  }

  async getAllDevices() {
    return this.prismaService.device.findMany({ select: { id: true, name: true } })
  }
}
