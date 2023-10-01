import * as http from 'http'

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AxiosError } from 'axios'
import Bonjour from 'bonjour-service'
import { catchError, firstValueFrom } from 'rxjs'

import { Device, PrismaService, Room } from '@plusone/elgato-persistence'

import { DevicePowerState } from './device-power-state'
import { DeviceDetailsResponseDto } from './dto/device-details-response.dto'
import { DeviceState } from './dto/device-state'
import { ElgatoDeviceDetailsDto } from './dto/elgato-device-details.dto'
import { ElgatoDeviceStateDto } from './dto/elgato-device-state.dto'

@Injectable()
export class DeviceService {
  private logger = new Logger(DeviceService.name)
  private bonjour = new Bonjour()

  constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService) {}

  async onModuleInit() {
    const knownDevices = await this.prismaService.device.count()
    this.logger.log(`Known devices: ${knownDevices}`)
  }

  async getAllDevices() {
    return this.prismaService.device.findMany({ include: { room: true } })
  }

  async getDevice(id: string): Promise<DeviceDetailsResponseDto> {
    const device = await this.prismaService.device.findUniqueOrThrow({
      include: { room: true },
      where: { id },
    })

    const beforeDeviceCallTS = Date.now()
    const accessoryInfo = await this.getDeviceAccessoryInfo(device)
    const currentState = await this.getDeviceState(device)
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

    return { name: device.name, id: device.id, room: device.room, lastSeen: device.lastSeen, details, state }
  }

  async toggle(id: string) {
    const device = await this.prismaService.device.findUniqueOrThrow({
      where: { id },
    })

    const currentState = await this.getDeviceState(device)

    await firstValueFrom(
      this.httpService
        .put(
          `http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`,
          JSON.stringify({ lights: [{ on: !currentState.lights[0].on }] }),
          {
            httpAgent: new http.Agent({ family: 4 }),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
  }

  async assignDeviceToRoom(deviceId: Device['id'], roomId: Room['id']) {
    await this.prismaService.device.update({
      where: { id: deviceId },
      data: { roomId },
    })
  }

  async setRoomState(roomId: Room['id'], targetState: DevicePowerState) {
    const devices = await this.prismaService.device.findMany({ where: { roomId } })
    for (const device of devices) {
      await firstValueFrom(
        this.httpService
          .put(
            `http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`,
            JSON.stringify({ lights: [{ on: targetState === 'on' ? 1 : 0 }] }),
            {
              httpAgent: new http.Agent({ family: 4 }),
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data)
              throw `Could not connect to '${device.host.replace('.local', '')}'`
            }),
          ),
      )
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async findDevices() {
    this.bonjour.find({ type: 'elg' }, async (service) => {
      this.logger.debug(`Got a response from a device: ${service.name}.`)
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

  @Cron(CronExpression.EVERY_10_MINUTES)
  private async checkKnownDevices() {
    const devices = await this.getAllDevices()
    for (const device of devices) {
      try {
        const NINE_MINUTES = 9 * 60 * 1_000
        if (Date.now() - device.lastSeen.valueOf() > NINE_MINUTES) {
          this.logger.debug(`Device ${device.name} hasn't been seen for over 9 minutes, pinging device now.`)
          await this.getDeviceAccessoryInfo(device)
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

  private async getDeviceState(device: Device) {
    const resp = await firstValueFrom(
      this.httpService
        .get<ElgatoDeviceStateDto>(`http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )

    return resp.data
  }

  private async getDeviceAccessoryInfo(device: Device) {
    const resp = await firstValueFrom(
      this.httpService
        .get<ElgatoDeviceDetailsDto>(
          `http://${device.host.replace('.local', '')}:${device.port}/elgato/accessory-info`,
          {
            httpAgent: new http.Agent({ family: 4 }),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
    return resp.data
  }
}
