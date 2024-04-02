import { Test } from '@nestjs/testing'

import { PrismaService } from '@plusone/elgato-persistence'

import { DeviceService } from '../device/device.service'

import { CommandsService } from './commands.service'

describe('CommandsService', () => {
  let commandsService: CommandsService
  let deviceService: DeviceService
  let prismaService: PrismaService

  let setPowerStateSpy: jest.SpyInstance
  let transitionToColorSpy: jest.SpyInstance

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DeviceService,
          useValue: {
            setPowerState: jest.fn(),
            transitionToColor: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            command: {
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
        CommandsService,
      ],
    }).compile()

    commandsService = moduleRef.get<CommandsService>(CommandsService)
    deviceService = moduleRef.get<DeviceService>(DeviceService)
    prismaService = moduleRef.get<PrismaService>(PrismaService)

    // default spy for asserting no calls
    setPowerStateSpy = jest.spyOn(deviceService, 'setPowerState')
    transitionToColorSpy = jest.spyOn(deviceService, 'transitionToColor')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('executeCommand', () => {
    it('should turn on devices when powerOnly is true', async () => {
      // @ts-expect-error actions are a relation and not included in the inferred type
      jest.spyOn(prismaService.command, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'my-test-command',
        actions: [
          {
            macAddress: 'de:vi:ce',
            on: true,
            powerOnly: true,
            hue: null,
            brightness: null,
            saturation: null,
          },
        ],
      })

      const setPowerStateSpy = jest.spyOn(deviceService, 'setPowerState')

      await commandsService.executeCommand('my-test-command')

      expect(setPowerStateSpy).toHaveBeenCalledTimes(1)
      expect(transitionToColorSpy).toHaveBeenCalledTimes(0)
    })

    it('should turn on devices when hue/brightness/saturation are null', async () => {
      // fail-safe, this should not happen as it is checked on input
      // @ts-expect-error actions are a relation and not included in the inferred type
      jest.spyOn(prismaService.command, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'my-test-command',
        actions: [
          {
            macAddress: 'de:vi:ce',
            on: true,
            powerOnly: false,
            hue: null,
            brightness: null,
            saturation: null,
          },
        ],
      })

      const setPowerStateSpy = jest.spyOn(deviceService, 'setPowerState')

      await commandsService.executeCommand('my-test-command')

      expect(setPowerStateSpy).toHaveBeenCalledTimes(1)
      expect(transitionToColorSpy).toHaveBeenCalledTimes(0)
    })

    it('should turn transition to color when hue/brightness/saturation are set', async () => {
      // @ts-expect-error actions are a relation and not included in the inferred type
      jest.spyOn(prismaService.command, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'my-test-command',
        actions: [
          {
            macAddress: 'de:vi:ce',
            on: true,
            powerOnly: false,
            hue: 0,
            brightness: 100,
            saturation: 100,
          },
        ],
      })

      const transitionToColorSpy = jest.spyOn(deviceService, 'transitionToColor')

      await commandsService.executeCommand('my-test-command')

      expect(setPowerStateSpy).toHaveBeenCalledTimes(0)
      expect(transitionToColorSpy).toHaveBeenCalledTimes(1)
    })

    it('should hande each device individually', async () => {
      // @ts-expect-error actions are a relation and not included in the inferred type
      jest.spyOn(prismaService.command, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'my-test-command',
        actions: [
          {
            macAddress: 'de:vi:c1',
            on: true,
            powerOnly: false,
            hue: 0,
            brightness: 100,
            saturation: 100,
          },
          {
            macAddress: 'de:vi:c2',
            on: true,
            powerOnly: true,
            hue: null,
            brightness: null,
            saturation: null,
          },
        ],
      })

      const transitionToColorSpy = jest.spyOn(deviceService, 'transitionToColor')

      await commandsService.executeCommand('my-test-command')

      expect(setPowerStateSpy).toHaveBeenCalledWith('de:vi:c2', { on: true })
      expect(transitionToColorSpy).toHaveBeenCalledWith('de:vi:c1', { hue: 0, saturation: 100, brightness: 100 })
    })
  })
})
