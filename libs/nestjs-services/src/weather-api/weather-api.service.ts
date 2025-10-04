import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response'
import { fetchWeatherApi } from 'openmeteo'
import { firstValueFrom } from 'rxjs'

export type FetchWeatherDataParams = {
  latitude: number
  longitude: number
}

type ElevationApiResponse = {
  elevation: [number]
}

@Injectable()
export class WeatherApiService {
  private static readonly WEATHER_VARIABLES = {
    temperature2m: 'temperature_2m',
    rain: 'rain',
    soilMoisture0To1cm: 'soil_moisture_0_to_1cm',
    soilMoisture1To3cm: 'soil_moisture_1_to_3cm',
    soilMoisture3To9cm: 'soil_moisture_3_to_9cm',
    soilMoisture9To27cm: 'soil_moisture_9_to_27cm',
    soilTemperature0cm: 'soil_temperature_0cm',
    soilTemperature6cm: 'soil_temperature_6cm',
    windGusts10m: 'wind_gusts_10m',
  }

  private static readonly HOURLY_WEATHER_VARIABLES = Object.values(WeatherApiService.WEATHER_VARIABLES)

  constructor(private readonly httpService: HttpService) {}

  public async fetchWeatherData(
    params: FetchWeatherDataParams,
    pastDays: number,
  ): Promise<Record<keyof typeof WeatherApiService.WEATHER_VARIABLES, Float32Array<never>> & { time: Array<Date> }> {
    const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/forecast', {
      past_days: pastDays,
      forecast_days: 3,
      hourly: WeatherApiService.HOURLY_WEATHER_VARIABLES,
      timezone: 'UTC',
      ...params,
    })

    return this.parseWeatherApiResponse(responses[0])
  }

  public async getHeightForCoordinates(params: FetchWeatherDataParams): Promise<number> {
    const elevationApiResponse = await firstValueFrom(
      this.httpService.get<ElevationApiResponse>(
        `https://api.open-meteo.com/v1/elevation?latitude=${params.latitude}&longitude=${params.longitude}`,
      ),
    )
    return elevationApiResponse.data.elevation[0]
  }

  private parseWeatherApiResponse(response: WeatherApiResponse) {
    const utcOffsetSeconds = response.utcOffsetSeconds()
    const hourly = response.hourly()
    if (hourly === null) {
      throw new Error('No hourly data available.')
    }

    return {
      time: this.range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1_000),
      ),
      ...Object.keys(WeatherApiService.WEATHER_VARIABLES).reduce(
        (previousValue, currentValue: keyof typeof WeatherApiService.WEATHER_VARIABLES, currentIndex) => {
          return {
            ...previousValue,
            [currentValue]: hourly.variables(currentIndex)?.valuesArray(),
          }
        },
        {} as Record<keyof typeof WeatherApiService.WEATHER_VARIABLES, Float32Array<never>>,
      ),
    }
  }

  private range(start: number, stop: number, step: number) {
    return Array.from({ length: (stop - start) / step }, (_, i) => start + i * step)
  }
}
