import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'

import { PrismaService } from '@plusone/elgato-persistence'

import { DevicePowerState } from '../device/device-power-state'
import { ElgatoService } from '../elgato/elgato.service'
import { sunrise } from '../elgato/scenes/sunrise'
import { getTotalDurationInMs } from '../elgato/scenes/utils'
import { LocationService } from '../location/location.service'

@Injectable()
export class SunriseSunsetService implements OnModuleInit {
  private logger = new Logger(SunriseSunsetService.name)

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

      // Only create a job if dawn is after now
      if (sunriseSunsetTimes.dawn > new Date()) {
        // Clear existing jobs/timeouts from yesterday or after service restart
        if (this.schedulerRegistry.doesExist('cron', 'sunrise')) {
          this.logger.debug('Clearing cron job: sunrise')
          this.schedulerRegistry.deleteCronJob('sunrise')
        }
        if (this.schedulerRegistry.doesExist('timeout', 'sunrise')) {
          this.logger.debug('Clearing timeout: sunrise')
          clearTimeout(this.schedulerRegistry.getTimeout('sunrise'))
        }

        const sunriseJob = new CronJob({
          cronTime: sunriseSunsetTimes.dawn,
          onTick: () => {
            this.logger.log(`Starting sunrise for ${devices.length}: [${devices.map((d) => d.name).join(', ')}]`)
            devices.forEach((d) => this.elgatoService.setLightStripState(d, sunrise))

            const turnOffCallback = () => {
              this.logger.log(
                `Turning off ${devices.length} devices after sunrise: [${devices.map((d) => d.name).join(', ')}]`,
              )
              devices.forEach((device) => this.elgatoService.setDevicePowerState(device, DevicePowerState.off))
            }

            // The last scene (brightness: 0) has a duration of 60s. Turn the device off during that duration.
            this.schedulerRegistry.addTimeout(
              'sunrise',
              setTimeout(turnOffCallback, sunriseSequenceTotalDuration - 30_000),
            )
          },
        })

        this.schedulerRegistry.addCronJob('sunrise', sunriseJob)
        this.logger.log(`Added sunrise cronjob for ${sunriseSunsetTimes.dawn.toLocaleTimeString()}`)
        sunriseJob.start()
      }
    } catch (e) {
      this.logger.error(e)
    }
  }
}
