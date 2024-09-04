import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import Bonjour, { Browser, Service } from 'bonjour-service'

import { DiscoveredDevice, Prisma, PrismaService } from '@plusone/elgato-persistence'

import { mapProductNameToDeviceType } from '../../shared/map-product-name-to-device-type'
import { DeviceType } from '../device/enum/device-type'
import { ElgatoService } from '../elgato/elgato.service'

import DiscoveredDeviceCreateInput = Prisma.DiscoveredDeviceCreateInput

@Injectable()
export class DeviceDiscoveryService implements OnModuleInit {
  private logger = new Logger(DeviceDiscoveryService.name)
  #bonjour: Bonjour
  #browser: Browser

  constructor(
    private readonly prismaService: PrismaService,
    private readonly elgatoService: ElgatoService,
  ) {}

  onModuleInit() {
    this.#bonjour = new Bonjour()
    this.#browser = this.#bonjour.find({ type: 'elg' })

    this.#browser.on('up', async (service: Service) => {
      this.logger.log(`Possible new device discovered: ${service.name} (${service.host})`)
    })
  }

  async getDiscoveredDevices(): Promise<Array<DiscoveredDevice>> {
    return this.prismaService.discoveredDevice.findMany()
  }

  async addDiscoveredDevice(id: string) {
    const discoveredDevice = await this.prismaService.discoveredDevice.findUniqueOrThrow({
      where: { id, isControlled: false },
    })

    if (discoveredDevice.ipv4 === null) {
      throw new Error(
        `IPv4 address for device ${discoveredDevice.displayName} (${discoveredDevice.macAddress}) is unknown but required.`,
      )
    }

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
      where: { macAddress: discoveredDevice.macAddress },
      create: {
        macAddress: discoveredDevice.macAddress,
        displayName: discoveredDevice.displayName,
        lastSeen: new Date(),
        type: mapProductNameToDeviceType(discoveredDevice.productName),
        address: discoveredDevice.ipv4,
        port: discoveredDevice.port,
      },
      update: { lastSeen: new Date() },
    })

    await this.prismaService.discoveredDevice.update({ where: { id }, data: { isControlled: true } })
  }

  async addManualDevice(address: string) {
    const port = 9123
    const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo({
      address,
      port,
      type: DeviceType.Unknown,
    })

    await this.prismaService.device.upsert({
      where: { macAddress: accessoryInfo.macAddress },
      create: {
        macAddress: accessoryInfo.macAddress,
        address,
        port,
        displayName: accessoryInfo.displayName,
        lastSeen: new Date(),
        type: mapProductNameToDeviceType(accessoryInfo.productName),
      },
      update: {
        address,
        port,
        displayName: accessoryInfo.displayName,
        lastSeen: new Date(),
      },
    })
  }

  @Cron(CronExpression.EVERY_30_SECONDS, { name: 'query-devices' })
  private async queryDevices() {
    this.#browser.update()

    for (const service of this.#browser.services) {
      if (await this.prismaService.discoveredDevice.findUnique({ where: { id: service.txt.id } })) {
        // We already know this device, skipping
        continue
      }
      const currentDeviceCount = await this.prismaService.discoveredDevice.count()

      try {
        // We need the mac address because it will become our id for controlled devices
        const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo({
          address: service.referer?.family === 'IPv4' ? service.referer.address : service.host.replace('.local', ''),
          type: DeviceType.Unknown,
          port: service.port,
        })

        // Check if the device is already controlled by our application
        const isControlled =
          (await this.prismaService.device.findUnique({ where: { macAddress: accessoryInfo.macAddress } })) !== null

        const input: Omit<DiscoveredDeviceCreateInput, 'id'> = {
          macAddress: accessoryInfo.macAddress,
          name: service.name,
          host: service.host,
          fqdn: service.fqdn,
          port: service.port,
          ipv4: service.referer?.family === 'IPv4' ? service.referer.address : null,
          displayName: accessoryInfo.displayName,
          productName: accessoryInfo.productName,
          isControlled,
        }

        await this.prismaService.discoveredDevice.upsert({
          where: { id: service.txt.id },
          create: { id: service.txt.id, ...input },
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
    }
  }
}
