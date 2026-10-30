import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { RidesService } from './rides.service'
import { CreateActivityDto, ActivityResponseDto, QueryActivityDto, UpdateActivityDto } from './dto/activity.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'

@ApiTags('rides')
@ApiBearerAuth()
@Controller('routes/:routeId/activities')
@UseGuards(JwtAuthGuard)
export class RidesController {
  private readonly logger = new Logger(RidesController.name)

  constructor(private readonly ridesService: RidesService) {}

  @Get()
  @ApiOperation({ operationId: 'listRouteActivities' })
  @ApiOkResponse({ description: 'List of activities', type: [ActivityResponseDto] })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Query() query: QueryActivityDto,
  ) {
    return this.ridesService.findAll(routeId, query, req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getRouteActivity' })
  @ApiOkResponse({ description: 'Activity details', type: ActivityResponseDto })
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) _routeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ridesService.findOne(id, req.user.sub)
  }

  @Post()
  @ApiOperation({ operationId: 'createRouteActivity' })
  @ApiOkResponse({ description: 'Activity created successfully', type: ActivityResponseDto })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.ridesService.create(routeId, dto, req.user.sub)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateRouteActivity' })
  @ApiOkResponse({ description: 'Activity updated successfully', type: ActivityResponseDto })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) _routeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.ridesService.update(id, dto, req.user.sub)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteRouteActivity' })
  @ApiOkResponse({ description: 'Activity deleted successfully' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) _routeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.ridesService.remove(id, req.user.sub)
    return { deleted: true, id }
  }

  @Get(':id/weather')
  @ApiOperation({ operationId: 'getRouteActivityWeather' })
  @ApiQuery({ name: 'date', required: false, description: 'Date to fetch weather for (ISO 8601)' })
  @ApiOkResponse({ description: 'Weather forecast for the ride date' })
  async getWeather(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ) {
    const activity = await this.ridesService.findOne(id, req.user.sub)
    const weatherDate = date ?? activity.riddenAt.toISOString().split('T')[0]
    return this.ridesService.getWeatherForecast(routeId, weatherDate)
  }
}
