import { HttpService } from '@nestjs/axios'
import { setupServer } from 'msw/node'

import { getAccessoryInfoResponseStub } from '../../stubs/accessory-info-response.stub'
import { getDevice } from '../../stubs/device.stub'
import {
  doesNotResolve,
  getAccessoryInfo,
  getLights,
  getSettings,
  getStuckDevice,
  postIdentify,
  putState,
  setDisplayName,
} from '../../stubs/handler'
import { DevicePowerState } from '../device/enum/device-power-state'
import { DeviceType } from '../device/enum/device-type'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoDeviceStateDto, LightStateWithColor } from './dto/elgato-device-state.dto'
import { ElgatoSettingsResponseDto } from './dto/elgato-settings-response.dto'
import { ElgatoService } from './elgato.service'

describe('ElgatoService', () => {
  const server = setupServer()
  let elgatoService: ElgatoService
  let httpService: HttpService
  let errSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  beforeEach(() => {
    server.resetHandlers(
      getAccessoryInfo(DeviceType.LightStrip),
      getAccessoryInfo(DeviceType.RingLight),
      getLights(DeviceType.LightStrip),
      getLights(DeviceType.RingLight),
      getSettings(),
      getStuckDevice(),
      doesNotResolve(),
      postIdentify(),
      putState(DeviceType.LightStrip),
      putState(DeviceType.RingLight),
      setDisplayName(),
    )
    httpService = new HttpService()
    elgatoService = new ElgatoService(httpService)

    // @ts-expect-error We need to spy on a private member to assert log statements
    errSpy = jest.spyOn(elgatoService.logger, 'error').mockImplementation()
    // @ts-expect-error We need to spy on a private member to assert log statements
    warnSpy = jest.spyOn(elgatoService.logger, 'warn').mockImplementation()
  })

  afterAll(() => {
    server.close()
  })

  describe('getDeviceAccessoryInfo', () => {
    it.each([
      { type: DeviceType.RingLight, displayName: 'My Ring Light Device', productName: 'Elgato Ring Light' },
      { type: DeviceType.LightStrip, displayName: 'My Light Strip Device', productName: 'Elgato Light Strip' },
    ])('should return the device accessory info for a $type', async ({ type, displayName, productName }) => {
      const expected: ElgatoAccessoryInfoResponseDto = getAccessoryInfoResponseStub({ displayName, productName })
      const actual = await elgatoService.getDeviceAccessoryInfo(getDevice(type))

      expect(actual).toStrictEqual(expected)
    })

    it('should throw error on unreachable host', async () => {
      // @ts-expect-error We need to spy on a private member to assert log statements
      elgatoService.logger.error = jest.fn()

      await expect(
        elgatoService.getDeviceAccessoryInfo({
          address: 'does-not-resolve',
          port: 9123,
          type: DeviceType.Unknown,
        }),
      ).rejects.toEqual(Error("Could not connect to 'does-not-resolve:9123'"))
    })
  })

  describe('identify', () => {
    it('should make a post request', async () => {
      await elgatoService.identify({ address: 'identify', port: 9123, type: DeviceType.Unknown })
    })

    it('should throw error on unreachable host', async () => {
      await expect(
        elgatoService.identify({
          address: 'does-not-resolve',
          port: 9123,
          type: DeviceType.Unknown,
        }),
      ).rejects.toThrow(Error("Could not connect to 'does-not-resolve:9123'"))

      expect(errSpy).toHaveBeenCalledWith(
        "There was an error when connecting to 'does-not-resolve:9123': 'Network error'",
      )
    })
  })

  describe('setDisplayName', () => {
    beforeEach(() => {
      server.use(setDisplayName(), doesNotResolve())
    })

    it('should make a put request', async () => {
      await elgatoService.setDisplayName(
        {
          address: 'display-name',
          port: 9123,
          type: DeviceType.Unknown,
        },
        'My new Display Name',
      )
    })

    it('should throw error on unreachable host', async () => {
      await expect(
        elgatoService.identify({
          address: 'does-not-resolve',
          port: 9123,
          type: DeviceType.Unknown,
        }),
      ).rejects.toThrow(Error("Could not connect to 'does-not-resolve:9123'"))

      expect(errSpy).toHaveBeenCalledWith(
        "There was an error when connecting to 'does-not-resolve:9123': 'Network error'",
      )
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

    it.each([
      { type: DeviceType.RingLight, light: { on: 1 } },
      { type: DeviceType.LightStrip, light: { on: 1, hue: 0, brightness: 0, saturation: 0 } },
    ])('should handle failure', async ({ type, light }) => {
      const expected: ElgatoDeviceStateDto = {
        numberOfLights: 1,
        lights: [light as LightStateWithColor],
      }
      const actual = await elgatoService.getDeviceState({
        address: 'my-stuck-device',
        port: 9123,
        type,
      })
      expect(actual).toStrictEqual(expected)

      if (type === DeviceType.LightStrip) {
        expect(warnSpy).toHaveBeenCalledWith(
          'Could not get state for my-stuck-device, there probably is a long sequence active.',
        )
      }
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
        address: 'my-lightstrip-device',
        port: 9123,
        type: DeviceType.LightStrip,
      })
      expect(actual).toStrictEqual(expected)
    })
  })

  describe('setDevicePowerState', () => {
    it.each([
      { type: DeviceType.LightStrip, state: DevicePowerState.on },
      { type: DeviceType.LightStrip, state: DevicePowerState.off },
      { type: DeviceType.RingLight, state: DevicePowerState.on },
      { type: DeviceType.RingLight, state: DevicePowerState.off },
    ])('should set the desired device power state', async ({ type, state }) => {
      await elgatoService.setDevicePowerState(getDevice(type), state)
    })

    it('should throw error on unreachable host', async () => {
      await expect(
        elgatoService.setDevicePowerState(
          {
            address: 'does-not-resolve',
            port: 9123,
            type: DeviceType.Unknown,
          },
          DevicePowerState.off,
        ),
      ).rejects.toThrow(Error("Could not connect to 'does-not-resolve:9123'"))

      expect(errSpy).toHaveBeenCalledWith(
        "There was an error when connecting to 'does-not-resolve:9123': 'Network error'",
      )
    })
  })

  describe('setLightStripScene', () => {
    it('should set desired color', async () => {
      await elgatoService.setLightStripScene(getDevice(DeviceType.LightStrip), {
        numberOfLights: 1,
        lights: [
          {
            id: 'my.test.scene',
            name: 'My Test Scene',
            numberOfSceneElements: 1,
            brightness: 100,
            on: 1,
            scene: [{ hue: 1, brightness: 1, saturation: 1, durationMs: 500, transitionMs: 500 }],
          },
        ],
      })
    })
  })

  describe('setLightStripColor', () => {
    it('should set desired color', async () => {
      await elgatoService.setLightStripColor(getDevice(DeviceType.LightStrip), { hue: 1, brightness: 1, saturation: 1 })
    })
  })
})
