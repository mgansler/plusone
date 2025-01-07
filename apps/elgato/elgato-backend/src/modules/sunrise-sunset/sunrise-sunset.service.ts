import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'

import { Device, PrismaService } from '@plusone/elgato-persistence'

import { DevicePowerState } from '../device/enum/device-power-state'
import { ElgatoService } from '../elgato/elgato.service'
import { sunrise } from '../elgato/scenes/sunrise'
import { getTotalDurationInMs } from '../elgato/scenes/utils'
import { LocationService } from '../location/location.service'

@Injectable()
export class SunriseSunsetService implements OnModuleInit {
  private logger = new Logger(SunriseSunsetService.name)

  private static START_SUNRISE_JOB_NAME = 'start-sunrise'
  private static STOP_SUNRISE_JOB_NAME = 'stop-sunrise'

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly elgatoService: ElgatoService,
    private readonly locationService: LocationService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    await this.setSunriseTimings()
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async setSunriseTimings() {
    // We want to start/end the sequence at dawn/dusk
    try {
      const sunriseSunsetTimes = await this.locationService.getLocationData()
      const devices = await this.prismaService.device.findMany({ where: { sunrise: true } })

      const sunriseSequenceTotalDuration = getTotalDurationInMs(sunrise)

      // Add a startSunriseJob if dawn is in the future
      if (sunriseSunsetTimes.dawn > new Date() && devices.length > 0) {
        this.overwriteCronJob(
          SunriseSunsetService.START_SUNRISE_JOB_NAME,
          CronJob.from({
            cronTime: sunriseSunsetTimes.dawn,
            start: true,
            onTick: () => {
              this.logger.log(
                `Starting sunrise for ${devices.length}: [${devices.map((device) => device.displayName).join(', ')}]`,
              )
              devices.forEach((device) => this.elgatoService.setLightStripScene(device, sunrise))
            },
          }),
        )
        this.logger.log(
          `Added ${SunriseSunsetService.START_SUNRISE_JOB_NAME} cronjob for ${sunriseSunsetTimes.dawn.toLocaleTimeString()}`,
        )
      }

      // The last scene (brightness: 0) has a duration of 60s. Turn the device off during that duration.
      const stopTime = new Date(sunriseSunsetTimes.dawn.getTime() + sunriseSequenceTotalDuration - 30_000)

      // Add a stopSunriseJob if dawn + sequenceLength is in the future
      if (stopTime > new Date() && devices.length > 0) {
        this.overwriteCronJob(
          SunriseSunsetService.STOP_SUNRISE_JOB_NAME,
          CronJob.from({
            cronTime: stopTime,
            start: true,
            onTick: () => {
              this.logger.log(
                `Turning off ${devices.length} devices after sunrise: [${devices.map((d) => d.displayName).join(', ')}]`,
              )
              devices.forEach((device: Device) => this.elgatoService.setDevicePowerState(device, DevicePowerState.off))
            },
          }),
        )
        this.logger.log(
          `Added ${SunriseSunsetService.STOP_SUNRISE_JOB_NAME} cronjob for ${stopTime.toLocaleTimeString()}`,
        )
      }
    } catch (e) {
      this.logger.error(e)
    }
  }

  private overwriteCronJob(name: string, job: CronJob) {
    if (this.schedulerRegistry.doesExist('cron', name)) {
      this.logger.debug(`Clearing cron job: ${name}`)
      this.schedulerRegistry.deleteCronJob(name)
    }

    this.schedulerRegistry.addCronJob(name, job)
  }
}
