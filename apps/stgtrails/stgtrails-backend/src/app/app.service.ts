import { Injectable, OnModuleInit } from '@nestjs/common'

import { TrailArea } from '@plusone/stgtrails-persistence'

import { SunriseSunsetService } from './sunrise-sunset.service'
import { WeatherService } from './weather.service'

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly sunriseSunsetService: SunriseSunsetService,
    private readonly weatherService: WeatherService,
  ) {}

  async onModuleInit() {
    // We call this on init to have data immediately available after new deployment
    await this.sunriseSunsetService.updateSunriseSunsetData()
    await this.weatherService.updateWeatherForecast()
  }

  public async fetchDataForNewArea(trailArea: TrailArea) {
    await this.sunriseSunsetService.updateSunriseSunsetData([trailArea])
    await this.weatherService.updateWeatherForecast([trailArea], true)
  }
}
