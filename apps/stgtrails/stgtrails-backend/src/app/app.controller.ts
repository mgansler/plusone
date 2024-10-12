import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { AppService } from './app.service'
import { SunriseSunsetResponseDto } from './dto/sunrise-sunset-response.dto'
import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { TrailUpdateDto } from './dto/trail-update.dto'
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
  async updateTrailArea(
    @Param('trailAreaId', ParseIntPipe) trailAreaId: number,
    @Body() trailArea: TrailAreaUpdateDto,
  ) {
    return this.appService.updateTrailArea(trailAreaId, trailArea)
  }

  @ApiOperation({ operationId: 'deleteTrailArea' })
  @Delete(':trailAreaId')
  async deleteTrailArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.appService.deleteTrailArea(trailAreaId)
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

  @ApiOperation({ operationId: 'updateTrail' })
  @Put('trails/:trailId')
  async updateTrail(@Param('trailId', ParseIntPipe) trailId: number, @Body() trail: TrailUpdateDto) {
    return this.appService.updateTrail(trailId, trail)
  }

  @ApiOperation({ operationId: 'deleteTrail' })
  @Delete('trails/:trailId')
  async deleteTrail(@Param('trailId', ParseIntPipe) trailId: number) {
    return this.appService.deleteTrail(trailId)
  }

  @ApiOperation({ operationId: 'getSunriseSunsetForTrailArea' })
  @ApiQuery({ name: 'days', type: Number, required: false })
  @ApiOkResponse({ type: [SunriseSunsetResponseDto] })
  @Get(':trailAreaId/sunriseSunset')
  async getSunriseSunsetForArea(
    @Param('trailAreaId', ParseIntPipe) trailAreaId: number,
    @Query('days', new DefaultValuePipe(4), ParseIntPipe) hours: number,
  ) {
    return this.appService.getSunriseSunsetOfArea(trailAreaId, hours)
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
