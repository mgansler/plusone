import http from 'http'

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { Device } from '@plusone/elgato-persistence'

import { TransitionToColorRequestDto } from '../device/dto/transition-to-color-request.dto'
import { DevicePowerState } from '../device/enum/device-power-state'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoDeviceStateDto } from './dto/elgato-device-state.dto'
import { ElgatoSceneRequestDto } from './dto/elgato-scene-request.dto'
import { ElgatoSettingsResponseDto } from './dto/elgato-settings-response.dto'

@Injectable()
export class ElgatoService {
  private logger = new Logger(ElgatoService.name)

  constructor(private readonly httpService: HttpService) {}

  async getDeviceAccessoryInfo(device: Pick<Device, 'host' | 'port'>) {
    const resp = await firstValueFrom(
      this.httpService
        .get<ElgatoAccessoryInfoResponseDto>(
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

  async getDeviceState(device: Pick<Device, 'host' | 'port'>): Promise<ElgatoDeviceStateDto> {
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

    if (typeof resp.data === 'string' && resp.data === '') {
      // There is probably a very long sequence active
      this.logger.warn(`Could not get state for ${device.host}, there probably is a long sequence active.`)
      return {
        lights: [{ on: 1, brightness: 0, saturation: 0, hue: 0 }],
        numberOfLights: 1,
      }
    }

    return resp.data
  }

  async getDeviceSettings(device: Pick<Device, 'host' | 'port'>): Promise<ElgatoSettingsResponseDto> {
    const resp = await firstValueFrom(
      this.httpService
        .get(`http://${device.host.replace('.local', '')}:${device.port}/elgato/lights/settings`, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error)
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

  async identify(device: Pick<Device, 'host' | 'port'>): Promise<void> {
    await firstValueFrom(
      this.httpService
        .post(`http://${device.host.replace('.local', '')}:${device.port}/elgato/identify`, undefined, {
          httpAgent: new http.Agent({ family: 4 }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error)
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

  setDevicePowerState(device: Pick<Device, 'host' | 'port'>, state: DevicePowerState) {
    return this.makePutRequest(device, { lights: [{ on: state === 'on' ? 1 : 0 }] })
  }

  setLightStripScene(device: Pick<Device, 'host' | 'port'>, scene: ElgatoSceneRequestDto) {
    return this.makePutRequest(device, scene)
  }

  setLightStripColor(device: Pick<Device, 'host' | 'port'>, color: TransitionToColorRequestDto) {
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
