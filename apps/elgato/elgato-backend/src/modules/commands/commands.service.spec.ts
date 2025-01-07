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
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        CommandsService,
      ],
    }).compile()

    commandsService = moduleRef.get<CommandsService, CommandsService>(CommandsService)
    deviceService = moduleRef.get<DeviceService, DeviceService>(DeviceService)
    prismaService = moduleRef.get<PrismaService, PrismaService>(PrismaService)

    // default spy for asserting no calls
    setPowerStateSpy = jest.spyOn(deviceService, 'setPowerState')
    transitionToColorSpy = jest.spyOn(deviceService, 'transitionToColor')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createCommand', () => {
    it('should create a command', async () => {
      const createSpy = jest.spyOn(prismaService.command, 'create').mockResolvedValue({
        id: 1,
        name: 'new-name',
        hash: 'fa15dcda61725e1a07c0afc636beca67',
      })

      const actual = await commandsService.createCommand({ name: 'new-name', actions: [] })

      expect(actual).toEqual({
        id: 1,
        name: 'new-name',
        hash: 'fa15dcda61725e1a07c0afc636beca67',
      })
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          name: 'new-name',
          hash: 'fa15dcda61725e1a07c0afc636beca67',
          actions: {
            createMany: { data: [] },
          },
        },
        include: {
          actions: true,
        },
      })
    })
  })

  describe('getCommands', () => {
    it('should return a list of commands', async () => {
      const findManySpy = jest.spyOn(prismaService.command, 'findMany').mockResolvedValue([])

      const actual = await commandsService.getCommands()

      expect(actual).toEqual({ commands: [] })
      expect(findManySpy).toHaveBeenCalledWith({ include: { actions: true } })
    })
  })

  describe('getCommand', () => {
    it('should return a list of commands', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.command, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'my-test-command',
        hash: 'md5-hash-of-name',
      })

      const actual = await commandsService.getCommand(1)

      expect(actual).toEqual({ hash: 'md5-hash-of-name', id: 1, name: 'my-test-command' })
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { id: 1 }, include: { actions: true } })
    })
  })

  describe('updateCommand', () => {
    it('should update a given command', async () => {
      const updateSpy = jest.spyOn(prismaService.command, 'update').mockResolvedValue({
        id: 1,
        name: 'new-name',
        hash: 'fa15dcda61725e1a07c0afc636beca67',
      })

      const actual = await commandsService.updateCommand(1, { name: 'new-name', actions: [] })

      expect(actual).toEqual({
        id: 1,
        name: 'new-name',
        hash: 'fa15dcda61725e1a07c0afc636beca67',
      })
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'new-name',
          hash: 'fa15dcda61725e1a07c0afc636beca67',
          actions: {
            deleteMany: { commandId: 1 },
            createMany: { data: [] },
          },
        },
        include: {
          actions: true,
        },
      })
    })
  })

  describe('deleteCommand', () => {
    it('should delete a command with the given id', async () => {
      const deleteSpy = jest.spyOn(prismaService.command, 'delete')

      await commandsService.deleteCommand(1)

      expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 1 } })
    })
  })

  describe('executeCommand', () => {
    it('should turn on devices when powerOnly is true', async () => {
      // @ts-expect-error actions are a relation and not included in the inferred type
      jest.spyOn(prismaService.command, 'findUniqueOrThrow').mockResolvedValue({
        id: 1,
        name: 'my-test-command',
        hash: 'md5-hash-of-name',
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
        hash: 'md5-hash-of-name',
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
        hash: 'md5-hash-of-name',
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
        hash: 'md5-hash-of-name',
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
