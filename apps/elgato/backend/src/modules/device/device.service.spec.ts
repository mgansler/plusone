import { Test } from '@nestjs/testing'

import { PrismaService } from '@plusone/elgato-persistence'

import { getAccessoryInfoResponseStub } from '../../stubs/accessory-info-response.stub'
import { getDevice } from '../../stubs/device.stub'
import { ElgatoService } from '../elgato/elgato.service'

import { DeviceService } from './device.service'
import { DevicePowerState } from './enum/device-power-state'
import { DeviceType } from './enum/device-type'

describe('DeviceService', () => {
  let deviceService: DeviceService
  let prismaService: PrismaService
  let elgatoService: ElgatoService

  const lastSeen = new Date()
  const deviceStub = getDevice(DeviceType.LightStrip, lastSeen)

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(lastSeen)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            device: {
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ElgatoService,
          useValue: {
            getDeviceAccessoryInfo: jest.fn(),
            getDeviceState: jest.fn(),
            setDisplayName: jest.fn(),
            setDevicePowerState: jest.fn(),
            setLightStripColor: jest.fn(),
            setLightStripScene: jest.fn(),
          },
        },
        DeviceService,
      ],
    }).compile()

    deviceService = moduleRef.get<DeviceService>(DeviceService)
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    elgatoService = moduleRef.get<ElgatoService>(ElgatoService)

    jest.spyOn(prismaService.device, 'findUniqueOrThrow').mockResolvedValue(deviceStub)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getDevice', () => {
    it('should return the device including all information', async () => {
      jest.spyOn(elgatoService, 'getDeviceAccessoryInfo').mockResolvedValue(
        getAccessoryInfoResponseStub({
          productName: 'Elgato Light Strip',
          displayName: 'My Light Strip Device',
        }),
      )

      jest.spyOn(elgatoService, 'getDeviceState').mockResolvedValue({
        numberOfLights: 1,
        lights: [{ on: 1, hue: 0, brightness: 100, saturation: 50 }],
      })

      const actual = await deviceService.getDevice('aa:bb:cc:dd:ee:ff')

      expect(actual).toEqual({
        details: {
          deviceType: 'LightStrip',
          displayName: 'My Light Strip Device',
          productName: 'Elgato Light Strip',
        },
        displayName: 'My Light Strip Device',
        lastSeen,
        macAddress: 'aa:bb:cc:dd:ee:ff',
        state: {
          brightness: 100,
          hue: 0,
          on: true,
          saturation: 50,
        },
      })
    })
  })

  describe('setDisplayName', () => {
    it('should update the display name', async () => {
      const setDisplayNameSpy = jest.spyOn(elgatoService, 'setDisplayName')
      const updateSpy = jest.spyOn(prismaService.device, 'update')

      await deviceService.setDisplayName('aa:bb:cc:dd:ee:ff', { displayName: 'New Display Name' })

      expect(setDisplayNameSpy).toHaveBeenCalledWith(deviceStub, 'New Display Name')
      expect(updateSpy).toHaveBeenCalledWith({
        where: { macAddress: 'aa:bb:cc:dd:ee:ff' },
        data: {
          displayName: 'New Display Name',
        },
      })
    })
  })

  describe('toggle', () => {
    it('should turn a on device off', async () => {
      jest.spyOn(elgatoService, 'getDeviceState').mockResolvedValue({
        numberOfLights: 1,
        lights: [{ on: 1 }],
      })

      const setDevicePowerStateSpy = jest.spyOn(elgatoService, 'setDevicePowerState')

      await deviceService.toggle('aa:bb:cc:dd:ee:ff')

      expect(setDevicePowerStateSpy).toHaveBeenCalledWith(deviceStub, DevicePowerState.off)
    })

    it('should turn a off device on', async () => {
      jest.spyOn(elgatoService, 'getDeviceState').mockResolvedValue({
        numberOfLights: 1,
        lights: [{ on: 0 }],
      })

      const setDevicePowerStateSpy = jest.spyOn(elgatoService, 'setDevicePowerState')

      await deviceService.toggle('aa:bb:cc:dd:ee:ff')

      expect(setDevicePowerStateSpy).toHaveBeenCalledWith(deviceStub, DevicePowerState.on)
    })
  })

  describe('setPowerState', () => {
    it('should turn a device on', async () => {
      const setDevicePowerStateSpy = jest.spyOn(elgatoService, 'setDevicePowerState')

      await deviceService.setPowerState('aa:bb:cc:dd:ee:ff', { on: true })

      expect(setDevicePowerStateSpy).toHaveBeenCalledWith(deviceStub, DevicePowerState.on)
    })

    it('should turn a device off', async () => {
      const setDevicePowerStateSpy = jest.spyOn(elgatoService, 'setDevicePowerState')

      await deviceService.setPowerState('aa:bb:cc:dd:ee:ff', { on: false })

      expect(setDevicePowerStateSpy).toHaveBeenCalledWith(deviceStub, DevicePowerState.off)
    })
  })

  describe('transitionToColor', () => {
    it('should transition to the color', async () => {
      jest.spyOn(elgatoService, 'getDeviceAccessoryInfo').mockResolvedValue(
        getAccessoryInfoResponseStub({
          productName: 'Elgato Light Strip',
          displayName: 'My Light Strip Device',
        }),
      )

      jest.spyOn(elgatoService, 'getDeviceState').mockResolvedValue({
        numberOfLights: 1,
        lights: [{ on: 1, hue: 0, brightness: 100, saturation: 50 }],
      })

      const setLightStripSceneSpy = jest.spyOn(elgatoService, 'setLightStripScene')
      const setLightStripColor = jest.spyOn(elgatoService, 'setLightStripColor')

      await deviceService.transitionToColor('aa:bb:cc:dd:ee:ff', { hue: 100, brightness: 90, saturation: 30 })

      expect(setLightStripSceneSpy).toHaveBeenCalledWith(deviceStub, {
        numberOfLights: 1,
        lights: [
          {
            brightness: 100,
            id: 'de.martingansler.elgato.scene.transition',
            name: 'Transition',
            numberOfSceneElements: 2,
            on: 1,
            scene: [
              {
                hue: 0,
                saturation: 50,
                brightness: 100,
                durationMs: 100,
                transitionMs: 0,
              },
              {
                hue: 100,
                saturation: 30,
                brightness: 90,
                durationMs: 60_000,
                transitionMs: 1_000,
              },
            ],
          },
        ],
      })

      expect(setLightStripColor).not.toHaveBeenCalled()
      jest.advanceTimersByTime(1_100)
      expect(setLightStripColor).toHaveBeenCalledWith(deviceStub, { hue: 100, brightness: 90, saturation: 30 })
    })
  })
})
