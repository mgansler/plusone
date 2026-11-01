import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'

import { RoutesService } from './routes.service'
import { CreateRouteDto, QueryRouteDto, UpdateRouteDto } from './dto/route.dto'
import { NearbyRouteResponseDto } from './dto/nearby-route-response.dto'
import { ListRoutesResponseDto, RouteResponseDto } from './dto/list-routes-response.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { AuthService } from './auth.service'
import { readUploadedGpx, UploadedGpxFile } from './gpx-upload.util'

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
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ operationId: 'importGpx' })
  @ApiBearerAuth()
  async importGpx(
    @Req() req: Request & { user: JwtPayload },
    @UploadedFile() file: UploadedGpxFile | undefined,
    @Body() dto: CreateRouteDto,
  ) {
    const gpxContent = readUploadedGpx(file)

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per_page', new DefaultValuePipe(50), ParseIntPipe) per_page: number,
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
    @Query('lat', ParseFloatPipe) latitude: number,
    @Query('lng', ParseFloatPipe) longitude: number,
    @Query('radius', ParseFloatPipe) radius: number,
  ) {
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
