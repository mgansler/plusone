import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import Bonjour from 'bonjour-service'

import { PrismaService } from '@plusone/elgato-persistence'

import { mapProductNameToDeviceType } from '../../shared/map-product-name-to-device-type'
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
    return this.prismaService.device.findMany()
  }

  async getDevice(id: string): Promise<DeviceDetailsResponseDto> {
    const device = await this.prismaService.device.findUniqueOrThrow({
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
      deviceType: mapProductNameToDeviceType(accessoryInfo.productName),
      productName: accessoryInfo.productName,
    }

    const state: DeviceState = {
      on: currentState.lights[0].on === 1,
      ...this.getCurrentColor(currentState.lights[0]),
    }

    return {
      id: device.id,
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

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'check-devices' })
  private async checkKnownDevices() {
    const devices = await this.getAllDevices()
    for (const device of devices) {
      const lastSeenMinutes = Math.floor((Date.now() - device.lastSeen.valueOf()) / 60 / 1_000)

      try {
        if (lastSeenMinutes > 11) {
          await this.elgatoService.getDeviceAccessoryInfo(device)

          await this.prismaService.device.update({
            where: { id: device.id },
            data: {
              lastSeen: new Date(),
            },
          })
        }
      } catch (e) {
        this.logger.warn(
          `Could not reach ${device.displayName} for ${lastSeenMinutes} minutes, trying again in 10 minutes.`,
        )
      }
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
