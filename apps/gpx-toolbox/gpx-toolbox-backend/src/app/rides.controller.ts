import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { RidesService } from './rides.service'
import { CreateFahrtDto, UpdateFahrtDto, QueryFahrtDto, FahrtResponseDto } from './dto/ride.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'

@ApiTags('rides')
@ApiBearerAuth()
@Controller('routes/:routeId/fahrten')
@UseGuards(JwtAuthGuard)
export class RidesController {
  private readonly logger = new Logger(RidesController.name)

  constructor(private readonly ridesService: RidesService) {}

  @Get()
  @ApiOperation({ operationId: 'listFahrten' })
  @ApiQuery({ type: QueryFahrtDto, required: false })
  @ApiOkResponse({ description: 'List of fahrten', type: [FahrtResponseDto] })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Query() query: QueryFahrtDto,
  ) {
    return this.ridesService.findAll(routeId, query, req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getFahrt' })
  @ApiOkResponse({ description: 'Fahrt details', type: FahrtResponseDto })
  async findOne(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    return this.ridesService.findOne(id, req.user.sub)
  }

  @Post()
  @ApiOperation({ operationId: 'createFahrt' })
  @ApiOkResponse({ description: 'Fahrt created successfully', type: FahrtResponseDto })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: CreateFahrtDto,
  ) {
    return this.ridesService.create(routeId, dto, req.user.sub)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateFahrt' })
  @ApiOkResponse({ description: 'Fahrt updated successfully', type: FahrtResponseDto })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFahrtDto,
  ) {
    return this.ridesService.update(id, dto, req.user.sub)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteFahrt' })
  @ApiOkResponse({ description: 'Fahrt deleted successfully' })
  async remove(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    await this.ridesService.remove(id, req.user.sub)
    return { deleted: true, id }
  }

  @Get(':id/weather')
  @ApiOperation({ operationId: 'getFahrtWeather' })
  @ApiQuery({ name: 'date', required: false, description: 'Date to fetch weather for (ISO 8601)' })
  @ApiOkResponse({ description: 'Weather forecast for the ride date' })
  async getWeather(
    @Req() req: Request & { user: JwtPayload },
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ) {
    const fahrt = await this.ridesService.findOne(id, req.user.sub)
    const weatherDate = date ?? fahrt.riddenAt.split('T')[0]
    return this.ridesService.getWeatherForecast(routeId, weatherDate)
  }
}
