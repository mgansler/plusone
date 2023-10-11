import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import Bonjour from 'bonjour-service'

import { Device, Group, PrismaService } from '@plusone/elgato-persistence'

import { ElgatoDeviceDetailsDto } from '../elgato/dto/elgato-device-details.dto'
import { ElgatoService } from '../elgato/elgato.service'

import { DevicePowerState } from './device-power-state'
import { DeviceDetailsResponseDto } from './dto/device-details-response.dto'
import { DeviceState } from './dto/device-state'

@Injectable()
export class DeviceService {
  private logger = new Logger(DeviceService.name)
  private bonjour = new Bonjour()

  constructor(private readonly prismaService: PrismaService, private readonly elgatoService: ElgatoService) {}

  async onModuleInit() {
    const knownDevices = await this.prismaService.device.count()
    this.logger.log(`Known devices: ${knownDevices}`)
  }

  async getAllDevices() {
    return this.prismaService.device.findMany({ include: { groups: true } })
  }

  async getDevice(id: string): Promise<DeviceDetailsResponseDto> {
    const device = await this.prismaService.device.findUniqueOrThrow({
      include: { groups: true },
      where: { id },
    })

    const beforeDeviceCallTS = Date.now()
    const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo(device)
    const currentState = await this.elgatoService.getDeviceState(device)
    const afterDeviceCallTS = Date.now()
    if (afterDeviceCallTS - beforeDeviceCallTS > 200) {
      this.logger.debug(`Querying the device took longer then expected: ${afterDeviceCallTS - beforeDeviceCallTS} ms`)
    }

    const details: ElgatoDeviceDetailsDto = {
      displayName: accessoryInfo.displayName,
      productName: accessoryInfo.productName,
    }

    const state: DeviceState = {
      on: currentState.lights[0].on === 1,
    }

    return { name: device.name, id: device.id, groups: device.groups, lastSeen: device.lastSeen, details, state }
  }

  async toggle(id: string) {
    const device = await this.prismaService.device.findUniqueOrThrow({
      where: { id },
    })

    const currentState = await this.elgatoService.getDeviceState(device)

    await this.elgatoService.setDevicePowerState(
      device,
      currentState.lights[0].on === 1 ? DevicePowerState.off : DevicePowerState.on,
    )
  }

  async addDeviceToGroup(deviceId: Device['id'], groupId: Group['id']) {
    await this.prismaService.group.update({
      where: { id: groupId },
      data: {
        devices: {
          connect: {
            id: deviceId,
          },
        },
      },
    })
  }

  async setGroupState(groupId: Group['id'], targetState: DevicePowerState) {
    const devices = await this.prismaService.device.findMany({ where: { groups: { some: { id: groupId } } } })
    for (const device of devices) {
      await this.elgatoService.setDevicePowerState(device, targetState)
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS, { name: 'find-devices' })
  private async findDevices() {
    this.bonjour.find({ type: 'elg' }, async (service) => {
      // this.logger.debug(`Got a response from a device: ${service.name}.`)
      const currentDeviceCount = await this.prismaService.device.count()
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
          lastSeen: new Date(),
        },
        update: {
          fqdn: service.fqdn,
          host: service.host,
          port: service.port,
          lastSeen: new Date(),
        },
      })
      const updatedDeviceCount = await this.prismaService.device.count()
      if (currentDeviceCount !== updatedDeviceCount) {
        this.logger.log(`Known devices: ${updatedDeviceCount}`)
      }
    })
  }

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'check-devices' })
  private async checkKnownDevices() {
    const devices = await this.getAllDevices()
    for (const device of devices) {
      try {
        const lastSeenMinutes = Math.floor((Date.now() - device.lastSeen.valueOf()) / 60 / 1_000)
        if (Date.now() - device.lastSeen.valueOf() > 9) {
          this.logger.debug(
            `Device ${device.name} hasn't been seen for over ${lastSeenMinutes} minutes, pinging device now.`,
          )
          await this.elgatoService.getDeviceAccessoryInfo(device)
          await this.prismaService.device.update({
            data: {
              lastSeen: new Date(),
            },
            where: { id: device.id },
          })
        }
      } catch (e) {
        this.logger.warn(`Could not reach ${device.name}, trying again in 10 minutes.`)
      }
    }
  }
}
