import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import Bonjour from 'bonjour-service'

import { DiscoveredDevice, Prisma, PrismaService } from '@plusone/elgato-persistence'

import { mapProductNameToDeviceType } from '../../shared/map-product-name-to-device-type'
import { DeviceType } from '../device/enum/device-type'
import { ElgatoService } from '../elgato/elgato.service'

import DiscoveredDeviceCreateInput = Prisma.DiscoveredDeviceCreateInput

@Injectable()
export class DeviceDiscoveryService {
  private logger = new Logger(DeviceDiscoveryService.name)
  private bonjour = new Bonjour()

  constructor(
    private readonly prismaService: PrismaService,
    private readonly elgatoService: ElgatoService,
  ) {}

  async getDiscoveredDevices(): Promise<Array<DiscoveredDevice>> {
    return this.prismaService.discoveredDevice.findMany()
  }

  async addDiscoveredDevice(id: string) {
    const discoveredDevice = await this.prismaService.discoveredDevice.findUniqueOrThrow({
      where: { id, isControlled: false },
    })

    try {
      await this.elgatoService.getDeviceAccessoryInfo({
        address: discoveredDevice.ipv4,
        port: discoveredDevice.port,
        type: DeviceType.Unknown,
      })
    } catch (e) {
      throw new HttpException('Could not reach device.', HttpStatus.NOT_FOUND)
    }

    await this.prismaService.device.upsert({
      where: { id },
      create: {
        id: id,
        displayName: discoveredDevice.displayName,
        lastSeen: new Date(),
        type: mapProductNameToDeviceType(discoveredDevice.productName),
        address: discoveredDevice.ipv4,
        port: discoveredDevice.port,
      },
      update: {
        lastSeen: new Date(),
      },
    })

    await this.prismaService.discoveredDevice.update({
      where: { id },
      data: { isControlled: true },
    })
  }

  async addManualDevice(address: string) {
    const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo({
      address,
      port: 9123,
      type: DeviceType.Unknown,
    })

    await this.prismaService.device.create({
      data: {
        id: accessoryInfo.macAddress,
        displayName: accessoryInfo.displayName,
        lastSeen: new Date(),
        type: mapProductNameToDeviceType(accessoryInfo.productName),
        address: address,
        port: 9123,
      },
    })
  }

  @Cron(CronExpression.EVERY_30_SECONDS, { name: 'discover-devices' })
  private async discoverDevices() {
    this.bonjour.find({ type: 'elg' }, async (service) => {
      const currentDeviceCount = await this.prismaService.discoveredDevice.count()

      try {
        const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo({
          address: service.referer.family === 'IPv4' ? service.referer.address : service.host,
          type: DeviceType.Unknown,
          port: service.port,
        })

        const input: Omit<DiscoveredDeviceCreateInput, 'id'> = {
          name: service.name,
          host: service.host,
          fqdn: service.fqdn,
          port: service.port,
          ipv4: service.referer.family === 'IPv4' ? service.referer.address : null,
          displayName: accessoryInfo.displayName,
          productName: accessoryInfo.productName,
        }

        await this.prismaService.discoveredDevice.upsert({
          where: { id: accessoryInfo.macAddress },
          create: {
            id: accessoryInfo.macAddress,
            ...input,
          },
          update: input,
        })

        const updatedDeviceCount = await this.prismaService.discoveredDevice.count()
        if (currentDeviceCount !== updatedDeviceCount) {
          this.logger.log(`Discovered a new device: ${accessoryInfo.displayName}.`)
        }
      } catch (e) {
        this.logger.warn(
          `There was a new device (${service.name}: ${service.host}), but it didn't respond when getting accessoryInfo.`,
        )
      }
    })
  }
}
