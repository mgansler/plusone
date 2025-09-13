import { Test } from '@nestjs/testing'

import { Device, DiscoveredDevice, PrismaModule, PrismaService } from '@plusone/elgato-persistence'

import { getAccessoryInfoResponseStub } from '../../stubs/accessory-info-response.stub'
import { DeviceType } from '../device/enum/device-type'
import { ElgatoModule } from '../elgato/elgato.module'
import { ElgatoService } from '../elgato/elgato.service'

import { DeviceDiscoveryService } from './device-discovery.service'

describe('DeviceDiscoveryService', () => {
  let prismaService: PrismaService
  let elgatoService: ElgatoService
  let deviceDiscoveryService: DeviceDiscoveryService

  const discoveredDevice: DiscoveredDevice = {
    displayName: 'Ring Light',
    fqdn: 'elg.local',
    host: 'elg',
    id: 'de:vi:ce:id',
    macAddress: 'ma:ca:dd:re:ss',
    ipv4: '127.0.0.1',
    isControlled: false,
    name: 'Ring Light 12ab',
    port: 9123,
    productName: 'Elgato Ring Light',
  }

  const device: Device = {
    address: '127.0.0.1',
    displayName: 'Ring Light',
    macAddress: 'ma:ca:dd:re:ss',
    lastSeen: new Date(),
    port: 9123,
    sunrise: false,
    sunset: false,
    type: DeviceType.RingLight,
  }

  const fakeTime = new Date(1970, 0, 1, 1, 0, 0, 0)

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(fakeTime)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ElgatoModule, PrismaModule],
      providers: [DeviceDiscoveryService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        discoveredDevice: {
          findMany: jest.fn(),
          findUniqueOrThrow: jest.fn(),
          update: jest.fn(),
        },
        device: {
          create: jest.fn(),
          upsert: jest.fn(),
        },
      })
      .compile()

    elgatoService = moduleRef.get<ElgatoService, ElgatoService>(ElgatoService)
    deviceDiscoveryService = moduleRef.get<DeviceDiscoveryService, DeviceDiscoveryService>(DeviceDiscoveryService)
    prismaService = moduleRef.get<PrismaService, PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getDiscoveredDevices', () => {
    it('should return an emtpy list', async () => {
      jest.spyOn(prismaService.discoveredDevice, 'findMany').mockResolvedValue([])

      const actual = await deviceDiscoveryService.getDiscoveredDevices()
      expect(actual).toEqual([])
    })

    it('should return a single device', async () => {
      jest.spyOn(prismaService.discoveredDevice, 'findMany').mockResolvedValue([discoveredDevice])

      const actual = await deviceDiscoveryService.getDiscoveredDevices()
      expect(actual).toEqual([discoveredDevice])
    })
  })

  describe('addDiscoveredDevice', () => {
    it('should not fail on adding a already controlled device', async () => {
      jest.spyOn(prismaService.discoveredDevice, 'findUniqueOrThrow').mockResolvedValue(discoveredDevice)
      jest.spyOn(elgatoService, 'getDeviceAccessoryInfo').mockResolvedValue(getAccessoryInfoResponseStub({}))
      const deviceUpsertSpy = jest.spyOn(prismaService.device, 'upsert').mockResolvedValue(device)
      const discoveredDeviceUpdateSpy = jest
        .spyOn(prismaService.discoveredDevice, 'update')
        .mockResolvedValue(discoveredDevice)

      await deviceDiscoveryService.addDiscoveredDevice('de:vi:ce:id')

      expect(deviceUpsertSpy).toHaveBeenCalledWith({
        where: { macAddress: 'ma:ca:dd:re:ss' },
        create: {
          address: device.address,
          displayName: device.displayName,
          macAddress: device.macAddress,
          lastSeen: fakeTime,
          port: device.port,
          type: DeviceType.RingLight,
        },
        update: { lastSeen: fakeTime },
      })
      expect(discoveredDeviceUpdateSpy).toHaveBeenCalledWith({
        where: { id: 'de:vi:ce:id' },
        data: { isControlled: true },
      })
    })

    it('should not add a device when accessory info cannot be retrieved', async () => {
      jest.spyOn(prismaService.discoveredDevice, 'findUniqueOrThrow').mockResolvedValue(discoveredDevice)
      jest.spyOn(elgatoService, 'getDeviceAccessoryInfo').mockRejectedValue(new Error('Could not connect'))
      const deviceUpsertSpy = jest.spyOn(prismaService.device, 'upsert')
      const discoveredDeviceUpdateSpy = jest.spyOn(prismaService.discoveredDevice, 'update')

      await expect(deviceDiscoveryService.addDiscoveredDevice('de:vi:ce:id')).rejects.toThrow('Could not reach device.')

      expect(deviceUpsertSpy).not.toHaveBeenCalled()
      expect(discoveredDeviceUpdateSpy).not.toHaveBeenCalled()
    })
  })

  describe('addManualDevice', () => {
    it('should add a device manually', async () => {
      jest.spyOn(elgatoService, 'getDeviceAccessoryInfo').mockResolvedValue(getAccessoryInfoResponseStub({}))
      const deviceUpsertSpy = jest.spyOn(prismaService.device, 'upsert').mockResolvedValue(device)

      await deviceDiscoveryService.addManualDevice('127.0.0.1')

      expect(deviceUpsertSpy).toHaveBeenCalledWith({
        where: { macAddress: 'ma:ca:dd:re:ss' },
        create: {
          macAddress: 'ma:ca:dd:re:ss',
          address: '127.0.0.1',
          port: 9123,
          displayName: 'My Generic Display Name',
          lastSeen: new Date(),
          type: DeviceType.LightStrip,
        },
        update: {
          address: '127.0.0.1',
          port: 9123,
          displayName: 'My Generic Display Name',
          lastSeen: new Date(),
        },
      })
    })

    it('should not add a device when accessory info cannot be retrieved', async () => {
      jest.spyOn(elgatoService, 'getDeviceAccessoryInfo').mockRejectedValue(new Error('Could not connect'))
      const deviceCreateSpy = jest.spyOn(prismaService.device, 'create')

      await expect(deviceDiscoveryService.addManualDevice('127.0.0.1')).rejects.toThrow('Could not connect')

      expect(deviceCreateSpy).not.toHaveBeenCalled()
    })
  })
})
