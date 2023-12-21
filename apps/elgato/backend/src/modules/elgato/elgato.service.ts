import http from 'http'

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError, AxiosResponse } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { Device } from '@plusone/elgato-persistence'

import { TransitionToColorRequestDto } from '../device/dto/transition-to-color-request.dto'
import { DevicePowerState } from '../device/enum/device-power-state'
import { DeviceType } from '../device/enum/device-type'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoDeviceStateDto } from './dto/elgato-device-state.dto'
import { ElgatoSceneRequestDto } from './dto/elgato-scene-request.dto'
import { ElgatoSettingsResponseDto } from './dto/elgato-settings-response.dto'

const httpAgent = new http.Agent({ family: 4 })

type DeviceAddress = Pick<Device, 'host' | 'port' | 'type'>

@Injectable()
export class ElgatoService {
  private logger = new Logger(ElgatoService.name)

  constructor(private readonly httpService: HttpService) {}

  async getDeviceAccessoryInfo(device: DeviceAddress) {
    const resp = await this.get<ElgatoAccessoryInfoResponseDto>(device, '/elgato/accessory-info')
    return resp.data
  }

  async getDeviceState(device: DeviceAddress): Promise<ElgatoDeviceStateDto> {
    const resp = await this.get<ElgatoDeviceStateDto>(device, '/elgato/lights')

    if (typeof resp.data === 'string' && resp.data === '') {
      if (device.type === DeviceType.LightStrip) {
        // There is probably a very long sequence active
        this.logger.warn(`Could not get state for ${device.host}, there probably is a long sequence active.`)
        return {
          lights: [{ on: 1, brightness: 0, saturation: 0, hue: 0 }],
          numberOfLights: 1,
        }
      } else {
        return {
          lights: [{ on: 1 }],
          numberOfLights: 1,
        }
      }
    }

    return resp.data
  }

  async getDeviceSettings(device: DeviceAddress): Promise<ElgatoSettingsResponseDto> {
    const resp = await this.get<ElgatoSettingsResponseDto>(device, '/elgato/lights/settings')
    return resp.data
  }

  async identify(device: DeviceAddress): Promise<void> {
    await firstValueFrom(
      this.httpService
        .post(`http://${device.host.replace('.local', '')}:${device.port}/elgato/identify`, undefined, {
          httpAgent,
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

  setDevicePowerState(device: DeviceAddress, state: DevicePowerState) {
    return this.put(device, '/elgato/lights', { lights: [{ on: state === 'on' ? 1 : 0 }] })
  }

  setLightStripScene(device: DeviceAddress, scene: ElgatoSceneRequestDto) {
    return this.put(device, '/elgato/lights', scene)
  }

  setLightStripColor(device: DeviceAddress, color: TransitionToColorRequestDto) {
    return this.put(device, '/elgato/lights', {
      lights: [{ on: 1, hue: color.hue, saturation: color.saturation, brightness: color.brightness }],
    })
  }

  private get<Response>(address: DeviceAddress, path: string): Promise<AxiosResponse<Response>> {
    const url = this.constructUrl(address, path)
    return firstValueFrom(
      this.httpService.get<Response>(url.toString(), { httpAgent }).pipe(
        catchError((error: AxiosError) => {
          if (error.code === 'ENOTFOUND') {
            this.logger.error(`Could not resolve '${url.hostname}' on current network.`)
          } else {
            this.logger.error(error.response.data)
          }
          throw `Could not connect to '${url.host}'`
        }),
      ),
    )
  }

  private put(address: DeviceAddress, path: string, payload: unknown) {
    const url = this.constructUrl(address, path)
    return firstValueFrom(
      this.httpService.put(url.toString(), JSON.stringify(payload), { httpAgent }).pipe(
        catchError((error: AxiosError) => {
          if (error.code === 'ENOTFOUND') {
            this.logger.error(`Could not resolve '${url.hostname}' on current network.`)
          } else {
            this.logger.error(error.response.data)
          }
          throw `Could not connect to '${url.host}'`
        }),
      ),
    )
  }

  private constructUrl(address: DeviceAddress, path: string): URL {
    const url = new URL(`http://${address.host.replace('.local', '')}:${address.port}`)
    url.pathname = path
    return url
  }
}
