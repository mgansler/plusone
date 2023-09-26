import * as http from 'http'

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AxiosError } from 'axios'
import Bonjour from 'bonjour-service'
import { catchError, firstValueFrom } from 'rxjs'

import { Device, PrismaService, Room } from '@plusone/elgato-persistence'

import { DeviceDetails, DeviceDetailsResponseDto, DeviceState } from './device.dto'

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
    return this.prismaService.device.findMany({ select: { id: true, name: true } })
  }

  async getDevice(id: string): Promise<DeviceDetailsResponseDto> {
    const device = await this.prismaService.device.findUniqueOrThrow({
      where: { id },
    })

    const beforeDeviceCallTS = Date.now()
    const accessoryInfo = await firstValueFrom(
      this.httpService
        .get<DeviceDetails>(`http://${device.host.replace('.local', '')}:${device.port}/elgato/accessory-info`, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
    const currentState = await this.getDeviceState(device)
    const afterDeviceCallTS = Date.now()
    if (afterDeviceCallTS - beforeDeviceCallTS > 200) {
      this.logger.debug(`Querying the device took longer then expected: ${afterDeviceCallTS - beforeDeviceCallTS} ms`)
    }

    const details: DeviceDetails = {
      displayName: accessoryInfo.data.displayName,
      productName: accessoryInfo.data.productName,
    }

    const state: DeviceState = {
      on: currentState.data.lights[0].on === 1,
    }

    return { name: device.name, id: device.id, details, state }
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
          JSON.stringify({ lights: [{ on: !currentState.data.lights[0].on }] }),
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

  async setRoomState(roomId: Room['id'], shouldBeOn: boolean) {
    const devices = await this.prismaService.device.findMany({ where: { roomId } })
    for (const device of devices) {
      await firstValueFrom(
        this.httpService
          .put(
            `http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`,
            JSON.stringify({ lights: [{ on: shouldBeOn ? 1 : 0 }] }),
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
        },
        update: {
          fqdn: service.fqdn,
          host: service.host,
          port: service.port,
        },
      })
      const updatedDeviceCount = await this.prismaService.device.count()
      if (currentDeviceCount !== updatedDeviceCount) {
        this.logger.log(`Known devices: ${updatedDeviceCount}`)
      }
    })
  }

  private getDeviceState(device: Device) {
    return firstValueFrom(
      this.httpService
        .get(`http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
  }
}
