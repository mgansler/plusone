import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  BadRequestException,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'

import { RidesService } from './rides.service'
import { CreateFahrtDto, UpdateFahrtDto, QueryFahrtDto, FahrtResponseDto } from './dto/ride.dto'

@ApiTags('rides')
@ApiBearerAuth()
@Controller('routes/:routeId/fahrten')
export class RidesController {
  private readonly logger = new Logger(RidesController.name)

  constructor(private readonly ridesService: RidesService) {}

  @Get()
  @ApiOperation({ operationId: 'listFahrten' })
  @ApiQuery({ type: QueryFahrtDto, required: false })
  @ApiOkResponse({ description: 'List of fahrten', type: [FahrtResponseDto] })
  async findAll(@Param('routeId', ParseUUIDPipe) routeId: string, @Query() query: QueryFahrtDto) {
    return this.ridesService.findAll(routeId, query)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getFahrt' })
  @ApiOkResponse({ description: 'Fahrt details', type: FahrtResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ridesService.findOne(id)
  }

  @Post()
  @ApiOperation({ operationId: 'createFahrt' })
  @ApiOkResponse({ description: 'Fahrt created successfully', type: FahrtResponseDto })
  async create(@Param('routeId', ParseUUIDPipe) routeId: string, @Body() dto: CreateFahrtDto) {
    return this.ridesService.create(routeId, dto)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateFahrt' })
  @ApiOkResponse({ description: 'Fahrt updated successfully', type: FahrtResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFahrtDto) {
    return this.ridesService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteFahrt' })
  @ApiOkResponse({ description: 'Fahrt deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.ridesService.remove(id)
    return { deleted: true, id }
  }

  @Get(':id/weather')
  @ApiOperation({ operationId: 'getFahrtWeather' })
  @ApiQuery({ name: 'date', required: false, description: 'Date to fetch weather for (ISO 8601)' })
  @ApiOkResponse({ description: 'Weather forecast for the ride date' })
  async getWeather(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ) {
    const fahrt = await this.ridesService.findOne(id)
    const weatherDate = date ?? fahrt.riddenAt.split('T')[0]
    return this.ridesService.getWeatherForecast(routeId, weatherDate)
  }
}
