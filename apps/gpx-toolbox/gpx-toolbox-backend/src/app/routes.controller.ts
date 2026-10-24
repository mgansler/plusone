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
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  Logger,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response, Request } from 'express'

import { RoutesService } from './routes.service'
import { CreateRouteDto, QueryRouteDto, UpdateRouteDto, ImportGpxResponseDto } from './dto/route.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import type { JwtPayload } from './jwt.strategy'

@ApiTags('routes')
@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name)

  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ operationId: 'importGpx' })
  @ApiBearerAuth()
  async importGpx(@Req() req: Request & { user: JwtPayload }, @UploadedFile() file: any, @Body() dto: CreateRouteDto) {
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
      this.logger.error(`Failed to import GPX: ${error.message}`, error.stack)
      throw new BadRequestException(error.message)
    }
  }

  @Get()
  @ApiOperation({ operationId: 'listRoutes' })
  @ApiBearerAuth()
  @ApiQuery({ type: QueryRouteDto, required: false })
  @ApiOkResponse({ description: 'List of routes' })
  async findAll(@Req() req: Request & { user: JwtPayload }, @Query() query: QueryRouteDto) {
    return this.routesService.findAll(query, req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getRoute' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Route details' })
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

  @Get('nearby')
  @ApiOperation({ operationId: 'findNearbyRoutes' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, description: 'Radius in kilometers' })
  @ApiOkResponse({ description: 'Routes within radius' })
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
}
