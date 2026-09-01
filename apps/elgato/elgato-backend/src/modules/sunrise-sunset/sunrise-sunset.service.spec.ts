import { SchedulerRegistry } from '@nestjs/schedule'
import { Test } from '@nestjs/testing'
import { Mock } from 'vitest'

import { PrismaService } from '@plusone/elgato-persistence'

import { ElgatoService } from '../elgato/elgato.service'
import { sunrise } from '../elgato/scenes/sunrise'
import { getTotalDurationInMs } from '../elgato/scenes/utils'
import { LocationService } from '../location/location.service'

import { SunriseSunsetService } from './sunrise-sunset.service'

describe('SunriseSunsetService', () => {
  let sunriseSunsetService: SunriseSunsetService
  let schedulerRegistry: SchedulerRegistry
  let prismaService: PrismaService

  let setLightStripScene: Mock
  let setDevicePowerState: Mock
  let addCronJobSpy: Mock

  const device = {
    macAddress: 'ma:ca:dd:re:ss',
    displayName: 'Elgato Fake Light',
  }

  const sunriseSequenceTotalDuration = getTotalDurationInMs(sunrise)

  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(async () => {
    vi.setSystemTime(new Date(1970, 0, 1, 1, 0, 0, 0))

    // Elgato Service
    setLightStripScene = vi.fn()
    setDevicePowerState = vi.fn()

    const moduleRef = await Test.createTestingModule({
      providers: [
        SchedulerRegistry,
        {
          provide: ElgatoService,
          useValue: {
            setLightStripScene,
            setDevicePowerState,
          },
        },
        {
          provide: PrismaService,
          useValue: {
            device: {
              findMany: vi.fn().mockResolvedValue([device]),
            },
          },
        },
        {
          provide: LocationService,
          useValue: {
            getLocationData: vi.fn().mockResolvedValue({
              dawn: new Date(1970, 0, 1, 1, 1, 0, 0),
            }),
          },
        },
        SunriseSunsetService,
      ],
    }).compile()

    sunriseSunsetService = moduleRef.get<SunriseSunsetService, SunriseSunsetService>(SunriseSunsetService)
    schedulerRegistry = moduleRef.get<SchedulerRegistry, SchedulerRegistry>(SchedulerRegistry)
    prismaService = moduleRef.get<PrismaService, PrismaService>(PrismaService)

    addCronJobSpy = vi.spyOn(schedulerRegistry, 'addCronJob')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('setSunriseTimings', () => {
    it('should start and stop the sequence', async () => {
      await sunriseSunsetService.setSunriseTimings()

      expect(addCronJobSpy).toHaveBeenCalledTimes(2)
      expect(addCronJobSpy).toHaveBeenNthCalledWith(1, 'start-sunrise', expect.anything())
      expect(addCronJobSpy).toHaveBeenNthCalledWith(2, 'stop-sunrise', expect.anything())

      // sunrise should not have been started yet
      expect(setLightStripScene).toHaveBeenCalledTimes(0)

      // dawn is set to 1 minute after "now"
      vi.advanceTimersByTime(60_000)

      // sunrise has been started
      expect(setLightStripScene).toHaveBeenCalledTimes(1)

      // advance time to 1 ms before supposed stop time of sequence
      vi.advanceTimersByTime(sunriseSequenceTotalDuration - 30_000 - 1)
      expect(setDevicePowerState).toHaveBeenCalledTimes(0)

      vi.advanceTimersByTime(1)
      expect(setDevicePowerState).toHaveBeenCalledTimes(1)
    })

    it('should only stop the sequence when we just started the application', async () => {
      // one minute after dawn
      vi.advanceTimersByTime(120_000)

      await sunriseSunsetService.setSunriseTimings()

      expect(addCronJobSpy).toHaveBeenCalledTimes(1)
      expect(addCronJobSpy).toHaveBeenNthCalledWith(1, 'stop-sunrise', expect.anything())

      // advance time to 1 ms before supposed stop time of sequence
      vi.advanceTimersByTime(sunriseSequenceTotalDuration - 60_000 - 30_000 - 1)
      expect(setDevicePowerState).toHaveBeenCalledTimes(0)

      vi.advanceTimersByTime(1)
      expect(setDevicePowerState).toHaveBeenCalledTimes(1)
    })

    it('should not start anything if dawn and end of sequence are in the future', async () => {
      // advance by 24 hours
      vi.advanceTimersByTime(24 * 60 * 60 * 1000)

      await sunriseSunsetService.setSunriseTimings()

      // no cron jobs
      expect(addCronJobSpy).toHaveBeenCalledTimes(0)

      // no turn on or off
      expect(setLightStripScene).toHaveBeenCalledTimes(0)
      expect(setDevicePowerState).toHaveBeenCalledTimes(0)
    })

    it('should clear existing cronjobs', async () => {
      vi.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true)
      const deleteCronJobSpy = vi.spyOn(schedulerRegistry, 'deleteCronJob').mockImplementation(vi.fn())

      await sunriseSunsetService.setSunriseTimings()

      expect(deleteCronJobSpy).toHaveBeenCalledTimes(2)
      expect(deleteCronJobSpy).toHaveBeenNthCalledWith(1, 'start-sunrise')
      expect(deleteCronJobSpy).toHaveBeenNthCalledWith(2, 'stop-sunrise')
    })

    it('should not add cronjobs if no devices are configured', async () => {
      vi.spyOn(prismaService.device, 'findMany').mockResolvedValue([])

      await sunriseSunsetService.setSunriseTimings()

      expect(addCronJobSpy).toHaveBeenCalledTimes(0)
    })
  })
})
