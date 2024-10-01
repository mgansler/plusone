import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { AppService } from './app.service'
import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { WeatherDataResponseDto } from './dto/weather-data-response.dto'

@Controller('trailAreas')
@ApiTags('trailAreas')
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

  @ApiOperation({ operationId: 'updateTrailArea' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  @Put(':trailAreaId')
  async updateTrailArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number, @Body() trail: TrailAreaUpdateDto) {
    return this.appService.updateTrailArea(trailAreaId, trail)
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
  @ApiQuery({ name: 'hours', type: Number, required: false })
  @ApiQuery({ name: 'utcOffsetHours', type: Number, required: false })
  @ApiOkResponse({ type: [WeatherDataResponseDto] })
  @Get(':trailAreaId/weather')
  async getWeatherData(
    @Param('trailAreaId', ParseIntPipe) trailAreaId: number,
    @Query('hours', new DefaultValuePipe(96), ParseIntPipe) hours: number,
    @Query('utcOffsetHours', new DefaultValuePipe(0), ParseIntPipe) utcOffsetHours: number,
  ): Promise<Array<WeatherDataResponseDto>> {
    return this.appService.getWeatherData(trailAreaId, hours, utcOffsetHours)
  }
}
