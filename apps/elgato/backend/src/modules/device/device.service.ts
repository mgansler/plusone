import { promises as dns } from 'dns'

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import Bonjour from 'bonjour-service'

import { Device, Group, PrismaService } from '@plusone/elgato-persistence'

import { LightStateWithColor } from '../elgato/dto/elgato-device-state.dto'
import {
  ElgatoSceneRequestDto,
  elgatoSceneRequestSchema,
  LightStateWithScene,
} from '../elgato/dto/elgato-scene-request.dto'
import { ElgatoService } from '../elgato/elgato.service'

import { DeviceDetailsResponseDto } from './dto/device-details-response.dto'
import { DeviceDisplayNameRequestDto } from './dto/device-display-name-request.dto'
import { DeviceState } from './dto/device-state'
import { ElgatoDeviceDetailsResponseDto } from './dto/elgato-device-details-response.dto'
import { TransitionToColorRequestDto } from './dto/transition-to-color-request.dto'
import { DevicePowerState } from './enum/device-power-state'
import { DeviceType } from './enum/device-type'

@Injectable()
export class DeviceService implements OnModuleInit {
  private logger = new Logger(DeviceService.name)
  private bonjour = new Bonjour()

  constructor(
    private readonly prismaService: PrismaService,
    private readonly elgatoService: ElgatoService,
  ) {}

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

    const details: ElgatoDeviceDetailsResponseDto = {
      displayName: accessoryInfo.displayName,
      deviceType: this.mapProductNameToDeviceType(accessoryInfo.productName),
      productName: accessoryInfo.productName,
    }

    const state: DeviceState = {
      on: currentState.lights[0].on === 1,
      ...this.getCurrentColor(currentState.lights[0]),
    }

    return {
      name: device.name,
      id: device.id,
      groups: device.groups,
      lastSeen: device.lastSeen,
      details,
      state,
      displayName: details.displayName,
    }
  }

  async setDisplayName(id: string, { displayName }: DeviceDisplayNameRequestDto) {
    const device = await this.prismaService.device.findUniqueOrThrow({
      where: { id },
    })

    await this.elgatoService.setDisplayName(device, displayName)
    await this.prismaService.device.update({
      where: { id },
      data: {
        displayName,
      },
    })
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

  async setPowerState(id: string, state: DeviceState) {
    const device = await this.prismaService.device.findUniqueOrThrow({
      where: { id },
    })

    await this.elgatoService.setDevicePowerState(device, state.on ? DevicePowerState.on : DevicePowerState.off)
  }

  async transitionToColor(id: string, color: TransitionToColorRequestDto) {
    const device = await this.getDevice(id)

    const scene = elgatoSceneRequestSchema.parse({
      numberOfLights: 1,
      lights: [
        {
          id: 'de.martingansler.elgato.scene.transition',
          brightness: 100,
          name: 'Transition',
          on: 1,
          numberOfSceneElements: 2,
          scene: [
            {
              hue: device.state.hue ?? color.hue,
              saturation: device.state.saturation ?? color.saturation,
              brightness: device.state.brightness ?? color.brightness,
              transitionMs: 0,
              durationMs: 100,
            },
            {
              hue: color.hue,
              saturation: color.saturation,
              brightness: color.brightness,
              transitionMs: 1_000,
              durationMs: 60_000,
            },
          ],
        },
      ],
    }) as ElgatoSceneRequestDto

    const d = await this.prismaService.device.findUniqueOrThrow({ where: { id } })
    await this.elgatoService.setLightStripScene(d, scene)
    new Promise((resolve) => setTimeout(resolve, 1_100)).then(() => {
      this.elgatoService.setLightStripColor(d, color)
    })
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

  async removeDeviceFromGroup(deviceId: Device['id'], groupId: Group['id']) {
    await this.prismaService.group.update({
      where: { id: groupId },
      data: {
        devices: {
          disconnect: {
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
      // TODO: get accessoryInfo and update type in DB
      const currentDeviceCount = await this.prismaService.device.count()
      const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo({
        host: service.host,
        port: service.port,
        address: service.referer.address,
        type: DeviceType.Unknown,
      })

      const deviceData: Omit<Device, 'id' | 'sunset' | 'sunrise'> = {
        name: service.name,
        fqdn: service.fqdn,
        host: service.host,
        address: service.referer.family === 'IPv4' ? service.referer.address : null,
        port: service.port,
        lastSeen: new Date(),
        type: this.mapProductNameToDeviceType(accessoryInfo.productName),
        displayName: accessoryInfo.displayName,
      }

      await this.prismaService.device.upsert({
        where: {
          id: service.txt.id,
        },
        create: {
          id: service.txt.id,
          ...deviceData,
        },
        update: {
          ...deviceData,
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
        if (lastSeenMinutes > 11) {
          this.logger.debug(
            `Device ${device.name} hasn't been seen for over ${lastSeenMinutes} minutes, pinging device now.`,
          )

          // Try manual lookup
          let address = device.address
          if (device.address === null) {
            try {
              address = (await dns.lookup(device.host.replace('.local', ''), 4)).address
            } catch (e) {
              this.logger.warn(`DNS lookup failed for ${device.name}.`)
            }
          }

          const accessoryInfo = await this.elgatoService.getDeviceAccessoryInfo({
            ...device,
            host: address,
          })

          await this.prismaService.device.update({
            data: {
              lastSeen: new Date(),
              address: address,
              type: this.mapProductNameToDeviceType(accessoryInfo.productName),
            },
            where: { id: device.id },
          })
        }
      } catch (e) {
        this.logger.warn(`Could not reach ${device.name}, trying again in 10 minutes.`)
      }
    }
  }

  private mapProductNameToDeviceType(productName: string): DeviceType {
    switch (productName) {
      case 'Elgato Ring Light':
        return DeviceType.RingLight
      case 'Elgato Light Strip':
        return DeviceType.LightStrip
      default:
        return DeviceType.Unknown
    }
  }

  private getCurrentColor(state: LightStateWithColor | LightStateWithScene): {
    hue: number
    saturation: number
    brightness: number
  } {
    const isLightStateWithScene = (state: LightStateWithColor | LightStateWithScene): state is LightStateWithScene => {
      return Array.isArray((state as LightStateWithScene).scene)
    }

    if (isLightStateWithScene(state)) {
      const lastElement = state.scene[state.scene.length - 1]
      return {
        hue: lastElement.hue,
        saturation: lastElement.saturation,
        brightness: lastElement.brightness,
      }
    }
    return {
      hue: state.hue,
      saturation: state.saturation,
      brightness: state.brightness,
    }
  }
}
