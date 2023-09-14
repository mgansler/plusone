import * as http from 'http'

import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import Bonjour from 'bonjour-service'
import { catchError, firstValueFrom } from 'rxjs'

import { PrismaService } from '@plusone/elgato-persistence'

import { DeviceDetails, DeviceDetailsResponseDto } from './device.dto'

@Injectable()
export class DeviceService {
  private logger = new Logger(DeviceService.name)

  constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService) {}

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

  async getDevice(id: string): Promise<DeviceDetailsResponseDto> {
    const device = await this.prismaService.device.findFirst({
      select: { id: true, name: true, host: true, port: true },
      where: { id },
    })
    if (device === null) {
      throw new HttpException(`The device with the given id '${id}' is currently not known.`, HttpStatus.NOT_FOUND)
    }

    const resp = await firstValueFrom(
      this.httpService
        .get<DeviceDetails>(`http://${device.host}:${device.port}/elgato/accessory-info`, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to '${device.host}'`
          }),
        ),
    )

    const details: DeviceDetails = {
      displayName: resp.data.displayName,
      productName: resp.data.productName,
    }

    return { name: device.name, id: device.id, details }
  }
}
