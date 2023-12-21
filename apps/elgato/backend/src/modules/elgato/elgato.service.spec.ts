import { HttpService } from '@nestjs/axios'
import { SetupServer, setupServer } from 'msw/node'

import { getAccessoryInfoResponse } from '../../stubs/accessory-info-response.stub'
import { getDevice } from '../../stubs/device.stub'
import { getAccessoryInfo, getLights, getSettings, getStuckDevice } from '../../stubs/handler'
import { DeviceType } from '../device/enum/device-type'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoDeviceStateDto, LightStateWithColor } from './dto/elgato-device-state.dto'
import { ElgatoSettingsResponseDto } from './dto/elgato-settings-response.dto'
import { ElgatoService } from './elgato.service'

describe('ElgatoService', () => {
  let server: SetupServer
  let elgatoService: ElgatoService
  let httpService: HttpService

  beforeAll(() => {
    server = setupServer(
      getAccessoryInfo(DeviceType.LightStrip),
      getAccessoryInfo(DeviceType.RingLight),
      getLights(DeviceType.LightStrip),
      getLights(DeviceType.RingLight),
      getSettings(),
      getStuckDevice(),
    )
    server.listen()
  })

  beforeEach(() => {
    server.resetHandlers()
    httpService = new HttpService()
    elgatoService = new ElgatoService(httpService)
  })

  afterAll(() => {
    server.close()
  })

  describe('getDeviceAccessoryInfo', () => {
    it.each([
      { type: DeviceType.RingLight, displayName: 'My Ring Light Device', productName: 'Elgato Ring Light' },
      { type: DeviceType.LightStrip, displayName: 'My Light Strip Device', productName: 'Elgato Light Strip' },
    ])('should return the device accessory info for a $type', async ({ type, displayName, productName }) => {
      const expected: ElgatoAccessoryInfoResponseDto = getAccessoryInfoResponse({ displayName, productName })
      const actual = await elgatoService.getDeviceAccessoryInfo(getDevice(type))

      expect(actual).toStrictEqual(expected)
    })
  })

  describe('getDeviceState', () => {
    it.each([
      { type: DeviceType.RingLight, light: { on: 1, temperature: 200 } },
      { type: DeviceType.LightStrip, light: { on: 1, hue: 0, brightness: 50, saturation: 50 } },
    ])('should return the device state for a $type', async ({ type, light }) => {
      const expected: ElgatoDeviceStateDto = { numberOfLights: 1, lights: [light as LightStateWithColor] }
      const actual = await elgatoService.getDeviceState(getDevice(type))

      expect(actual).toStrictEqual(expected)
    })

    it('should handle failure', async () => {
      const expected: ElgatoDeviceStateDto = {
        numberOfLights: 1,
        lights: [{ on: 1, hue: 0, brightness: 0, saturation: 0 } as LightStateWithColor],
      }
      const actual = await elgatoService.getDeviceState({
        host: 'my-stuck-device.local',
        port: 9123,
        type: DeviceType.LightStrip,
      })
      expect(actual).toStrictEqual(expected)
    })
  })

  describe('getDeviceSettings', () => {
    it('should return current device settings', async () => {
      const expected: ElgatoSettingsResponseDto = {
        colorChangeDurationMs: 0,
        powerOnBehavior: 0,
        powerOnBrightness: 0,
        powerOnHue: 0,
        powerOnSaturation: 0,
        switchOffDurationMs: 0,
        switchOnDurationMs: 0,
      }
      const actual = await elgatoService.getDeviceSettings({
        host: 'my-lightstrip-device',
        port: 9123,
        type: DeviceType.LightStrip,
      })
      expect(actual).toStrictEqual(expected)
    })
  })
})
