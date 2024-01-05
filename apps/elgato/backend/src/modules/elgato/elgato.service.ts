import http from 'http'

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError, AxiosResponse } from 'axios'
import { catchError, firstValueFrom, ObservableInput } from 'rxjs'

import { TransitionToColorRequestDto } from '../device/dto/transition-to-color-request.dto'
import { DevicePowerState } from '../device/enum/device-power-state'
import { DeviceType } from '../device/enum/device-type'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoDeviceStatePayloadDto } from './dto/elgato-device-state-payload.dto'
import { ElgatoDeviceStateDto } from './dto/elgato-device-state.dto'
import { ElgatoDisplayNamePayloadDto } from './dto/elgato-display-name-payload.dto'
import { ElgatoSceneRequestDto } from './dto/elgato-scene-request.dto'
import { ElgatoSettingsResponseDto } from './dto/elgato-settings-response.dto'

const httpAgent = new http.Agent({ family: 4 })

type DeviceAddress = {
  address: string
  port: number
  type: string // DeviceType
}

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
        this.logger.warn(`Could not get state for ${device.address}, there probably is a long sequence active.`)
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

  async identify(address: DeviceAddress): Promise<void> {
    const url = this.constructUrl(address, '/elgato/identify')
    await firstValueFrom(
      this.httpService
        .post(url.toString(), undefined, { httpAgent })
        .pipe(catchError((error: AxiosError) => this.handleError(error, url))),
    )
  }

  async setDisplayName(device: DeviceAddress, displayName: string) {
    const payload: ElgatoDisplayNamePayloadDto = { displayName }
    await this.put(device, '/elgato/accessory-info', payload)
  }

  setDevicePowerState(device: DeviceAddress, state: DevicePowerState) {
    const payload: ElgatoDeviceStatePayloadDto = { lights: [{ on: state === 'on' ? 1 : 0 }] }
    return this.put(device, '/elgato/lights', payload)
  }

  setLightStripScene(device: DeviceAddress, scene: ElgatoSceneRequestDto) {
    return this.put(device, '/elgato/lights', scene)
  }

  setLightStripColor(device: DeviceAddress, color: TransitionToColorRequestDto) {
    const payload: ElgatoDeviceStatePayloadDto = {
      lights: [{ on: 1, hue: color.hue, saturation: color.saturation, brightness: color.brightness }],
    }
    return this.put(device, '/elgato/lights', payload)
  }

  private get<Response>(address: DeviceAddress, path: string): Promise<AxiosResponse<Response>> {
    const url = this.constructUrl(address, path)
    return firstValueFrom(
      this.httpService
        .get<Response>(url.toString(), { httpAgent })
        .pipe(catchError((error: AxiosError) => this.handleError(error, url))),
    )
  }

  private put(address: DeviceAddress, path: string, payload: unknown) {
    const url = this.constructUrl(address, path)
    return firstValueFrom(
      this.httpService
        .put(url.toString(), JSON.stringify(payload), { httpAgent })
        .pipe(catchError((error: AxiosError) => this.handleError(error, url))),
    )
  }

  private constructUrl(deviceAddress: DeviceAddress, path: string): URL {
    const url = new URL(`http://${deviceAddress.address}:${deviceAddress.port}`)
    url.pathname = path
    return url
  }

  private handleError(error: AxiosError, url: URL): ObservableInput<never> {
    if (error.code === 'ENOTFOUND' || error.message === 'Network error') {
      this.logger.error(`Could not resolve '${url.hostname}' on current network.`)
    } else if (error.response?.data) {
      this.logger.error(error.response.data)
    }
    throw new Error(`Could not connect to '${url.host}'`)
  }
}
