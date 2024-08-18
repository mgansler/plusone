import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { AppService } from './app.service'
import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { WeatherDataResponseDto } from './dto/weather-data-response.dto'

@Controller('trailAreas')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ operationId: 'createTrailArea' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  @Post()
  async createTrailArea(@Body() trailArea: TrailAreaCreateDto) {
    return this.appService.createTrailArea(trailArea)
  }

  @ApiOperation({ operationId: 'getTrailAreas' })
  @ApiOkResponse({ type: [TrailAreaResponseDto] })
  @Get()
  async getTrailAreas() {
    return this.appService.getTrailAreas()
  }

  @ApiOperation({ operationId: 'createTrail' })
  @ApiOkResponse({ type: TrailResponseDto })
  @Post(':trailAreaId/trails')
  async createTrail(@Param('trailAreaId', ParseIntPipe) trailAreaId: number, @Body() trail: TrailCreateDto) {
    return this.appService.createTrail(trailAreaId, trail)
  }

  @ApiOperation({ operationId: 'getTrailsOfArea' })
  @ApiOkResponse({ type: [TrailResponseDto] })
  @Get(':trailAreaId/trails')
  async getTrailsOfArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.appService.getTrailsOfArea(trailAreaId)
  }

  @ApiOperation({ operationId: 'getWeatherDataForTrailArea' })
  @ApiOkResponse({ type: [WeatherDataResponseDto] })
  @Get(':trailAreaId/weather')
  async getWeatherData(
    @Param('trailAreaId', ParseIntPipe) trailAreaId: number,
  ): Promise<Array<WeatherDataResponseDto>> {
    return this.appService.getWeatherData(trailAreaId)
  }
}
