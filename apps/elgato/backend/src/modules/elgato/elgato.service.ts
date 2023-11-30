import http from 'http'

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { Device } from '@plusone/elgato-persistence'

import { TransitionToColorRequestDto } from '../device/dto/transition-to-color-request.dto'
import { DevicePowerState } from '../device/enum/device-power-state'

import { ElgatoDeviceDetailsDto } from './dto/elgato-device-details.dto'
import { ElgatoDeviceStateDto } from './dto/elgato-device-state.dto'
import { ElgatoSceneRequestDto } from './dto/elgato-scene-request.dto'

@Injectable()
export class ElgatoService {
  private logger = new Logger(ElgatoService.name)

  constructor(private readonly httpService: HttpService) {}

  async getDeviceAccessoryInfo(device: Device) {
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
            if (error.code === 'ENOTFOUND') {
              this.logger.error(`Could not resolve '${device.host.replace('.local', '')}' on current network.`)
            } else {
              this.logger.error(error.response.data)
            }
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
    return resp.data
  }

  async getDeviceState(device: Device) {
    const resp = await firstValueFrom(
      this.httpService
        .get<ElgatoDeviceStateDto>(`http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            if (error.code === 'ENOTFOUND') {
              this.logger.error(`Could not resolve '${device.host.replace('.local', '')}' on current network.`)
            } else {
              this.logger.error(error.response.data)
            }
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
    return resp.data
  }

  setDevicePowerState(device: Device, state: DevicePowerState) {
    return this.makePutRequest(device, { lights: [{ on: state === 'on' ? 1 : 0 }] })
  }

  setLightStripScene(device: Device, scene: ElgatoSceneRequestDto) {
    return this.makePutRequest(device, scene)
  }

  setLightStripColor(device: Device, color: TransitionToColorRequestDto) {
    return this.makePutRequest(device, {
      lights: [{ on: 1, hue: color.hue, saturation: color.saturation, brightness: color.brightness }],
    })
  }

  private makePutRequest(device: Pick<Device, 'host' | 'port'>, payload: unknown) {
    return firstValueFrom(
      this.httpService
        .put(`http://${device.host.replace('.local', '')}:${device.port}/elgato/lights`, JSON.stringify(payload), {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            if (error.code === 'ENOTFOUND') {
              this.logger.error(`Could not resolve '${device.host.replace('.local', '')}' on current network.`)
            } else {
              this.logger.error(error.response.data)
            }
            throw `Could not connect to '${device.host.replace('.local', '')}'`
          }),
        ),
    )
  }
}
