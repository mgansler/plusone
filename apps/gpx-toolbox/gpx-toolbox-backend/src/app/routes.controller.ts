import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'

import { RoutesService } from './routes.service'
import { CreateRouteDto, QueryRouteDto, UpdateRouteDto, ImportGpxResponseDto } from './dto/route.dto'

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name)

  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ operationId: 'importGpx' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'GPX file to import' },
        name: { type: 'string', description: 'Route name (optional, extracted from GPX if not provided)' },
        description: { type: 'string', description: 'Route description' },
        source: { type: 'string', enum: ['stravaRoute', 'stravaActivity', 'manualImport'], default: 'manualImport' },
      },
    },
  })
  @ApiOkResponse({ description: 'Route imported successfully', type: ImportGpxResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async importGpx(@UploadedFile() file: any, @Body() dto: CreateRouteDto) {
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
      return await this.routesService.importGpx(gpxContent, dto)
    } catch (error) {
      this.logger.error(`Failed to import GPX: ${error.message}`, error.stack)
      throw new BadRequestException(error.message)
    }
  }

  @Get()
  @ApiOperation({ operationId: 'listRoutes' })
  @ApiQuery({ type: QueryRouteDto, required: false })
  @ApiOkResponse({ description: 'List of routes' })
  async findAll(@Query() query: QueryRouteDto) {
    return this.routesService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getRoute' })
  @ApiOkResponse({ description: 'Route details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findById(id)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateRoute' })
  @ApiOkResponse({ description: 'Route updated successfully' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRouteDto) {
    return this.routesService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteRoute' })
  @ApiOkResponse({ description: 'Route deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.routesService.remove(id)
    return { deleted: true, id }
  }

  @Get(':id/export')
  @ApiOperation({ operationId: 'exportRoute' })
  @ApiOkResponse({ description: 'GPX file content' })
  async exportGpx(@Param('id', ParseUUIDPipe) id: string, @Res() response: Response) {
    const gpxContent = await this.routesService.exportGpx(id)

    response.setHeader('Content-Type', 'application/gpx+xml')
    response.setHeader('Content-Disposition', 'attachment; filename="route.gpx"')
    response.send(gpxContent)
  }

  @Get('nearby')
  @ApiOperation({ operationId: 'findNearbyRoutes' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, description: 'Radius in kilometers' })
  @ApiOkResponse({ description: 'Routes within radius' })
  async findNearby(@Query('lat') latitude: number, @Query('lng') longitude: number, @Query('radius') radius: number) {
    if (latitude == null || longitude == null || radius == null) {
      throw new BadRequestException('lat, lng, and radius are required')
    }
    return this.routesService.findNearby(latitude, longitude, radius)
  }
}
