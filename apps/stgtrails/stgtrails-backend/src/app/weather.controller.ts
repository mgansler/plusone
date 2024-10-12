import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { WeatherDataResponseDto } from './dto/weather-data-response.dto'
import { WeatherService } from './weather.service'

@Controller('weather')
@ApiTags('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiOperation({ operationId: 'getWeatherDataForTrailArea' })
  @ApiQuery({ name: 'trailAreaId', type: Number, required: true })
  @ApiQuery({ name: 'hours', type: Number, required: false })
  @ApiQuery({ name: 'utcOffsetHours', type: Number, required: false })
  @ApiOkResponse({ type: [WeatherDataResponseDto] })
  @Get()
  async getWeatherData(
    @Query('trailAreaId', ParseIntPipe) trailAreaId: number,
    @Query('hours', new DefaultValuePipe(96), ParseIntPipe) hours: number,
    @Query('utcOffsetHours', new DefaultValuePipe(0), ParseIntPipe) utcOffsetHours: number,
  ): Promise<Array<WeatherDataResponseDto>> {
    return this.weatherService.getWeatherDataForTrailArea(trailAreaId, hours, utcOffsetHours)
  }
}
