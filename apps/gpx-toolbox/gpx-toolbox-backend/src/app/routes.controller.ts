import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'

import { RoutesService } from './routes.service'
import { CreateRouteDto, QueryRouteDto, UpdateRouteDto } from './dto/route.dto'
import { NearbyRouteResponseDto } from './dto/nearby-route-response.dto'
import { ListRoutesResponseDto, RouteResponseDto } from './dto/list-routes-response.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { AuthService } from './auth.service'

@ApiTags('routes')
@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name)

  constructor(
    private readonly routesService: RoutesService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({ operationId: 'importGpx' })
  @ApiBearerAuth()
  async importGpx(
    @Req() req: Request & { user: JwtPayload },
    @UploadedFile() file: UploadedGpxFile | undefined,
    @Body() dto: CreateRouteDto,
  ) {
    if (!file) {
      throw new BadRequestException('No GPX file provided')
    }

    if (file.size > 50_000_000) {
      throw new BadRequestException('File size exceeds 50 MB limit')
    }

    if (!file.originalname?.toLowerCase().endsWith('.gpx')) {
      throw new BadRequestException('File must be a .gpx file')
    }

    const gpxContent = file.buffer.toString('utf-8')

    try {
      return await this.routesService.importGpx(gpxContent, dto, req.user.sub)
    } catch (error) {
      this.logger.error(`Failed to import GPX: ${error.message}`)
      throw new BadRequestException(error.message)
    }
  }

  @Get()
  @ApiOperation({ operationId: 'listRoutes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ListRoutesResponseDto, description: 'List of routes' })
  async findAll(@Req() req: Request & { user: JwtPayload }, @Query() query: QueryRouteDto) {
    return this.routesService.findAll(query, req.user.sub)
  }

  @Get(':id/export')
  @ApiOperation({ operationId: 'exportRoute' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'GPX file content' })
  async exportGpx(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const gpxContent = await this.routesService.exportGpx(id, req.user.sub)

    response.setHeader('Content-Type', 'application/gpx+xml')
    response.setHeader('Content-Disposition', 'attachment; filename="route.gpx"')
    response.send(gpxContent)
  }

  @Get('strava-activities')
  @ApiOperation({ operationId: 'listStravaActivities' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'per_page', type: Number, required: false, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'after', type: String, required: false, description: 'Only activities after this time (ISO 8601)' })
  @ApiQuery({
    name: 'before',
    type: String,
    required: false,
    description: 'Only activities before this time (ISO 8601)',
  })
  @ApiOkResponse({ description: 'List of Strava activities with metadata' })
  async listStravaActivities(
    @Req() req: Request & { user: JwtPayload },
    @Query('page', new ParseIntPipe()) page = 1,
    @Query('per_page', new ParseIntPipe()) per_page = 50,
    @Query('after') after?: string,
    @Query('before') before?: string,
  ) {
    const accessToken = await this.getStravaToken(req)
    return this.routesService.getStravaActivities(accessToken, req.user.sub, page, per_page, {
      after: toEpochSeconds(after, 'after'),
      before: toEpochSeconds(before, 'before'),
    })
  }

  @Get('nearby')
  @ApiOperation({ operationId: 'findNearbyRoutes' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, description: 'Radius in kilometers' })
  @ApiOkResponse({ type: [NearbyRouteResponseDto], description: 'Routes within radius' })
  async findNearby(
    @Req() req: Request & { user: JwtPayload },
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radius: number,
  ) {
    if (latitude == null || longitude == null || radius == null) {
      throw new BadRequestException('lat, lng, and radius are required')
    }
    return this.routesService.findNearby(latitude, longitude, radius, req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getRoute' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: RouteResponseDto, description: 'Route details' })
  async findOne(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findById(id, req.user.sub)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateRoute' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Route updated successfully' })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, dto, req.user.sub)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteRoute' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Route deleted successfully' })
  async remove(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    await this.routesService.remove(id, req.user.sub)
    return { deleted: true, id }
  }

  private async getStravaToken(req: Request & { user: JwtPayload }): Promise<string> {
    // Guarantees a valid token: refreshes transparently if the stored one is expired.
    return this.authService.getValidAccessToken(req.user.sub)
  }
}

/** Convert an optional ISO 8601 query parameter to epoch seconds as expected by the Strava API. */
function toEpochSeconds(value: string | undefined, name: string): number | undefined {
  if (!value) return undefined
  const time = new Date(value).getTime()
  if (isNaN(time)) {
    throw new BadRequestException(`${name} must be an ISO 8601 date`)
  }
  return Math.floor(time / 1000)
}

/** The parts of the multer upload the GPX import uses */
type UploadedGpxFile = { buffer: Buffer; originalname?: string; size: number }
