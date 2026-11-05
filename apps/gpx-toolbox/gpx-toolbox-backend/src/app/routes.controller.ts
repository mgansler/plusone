import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseFloatPipe,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { Request, Response } from 'express'

import { RoutesService } from './routes.service'
import {
  CreateRouteDto,
  ImportRouteResultDto,
  ImportRouteUploadDto,
  QueryRouteDto,
  UpdateRouteDto,
} from './dto/route.dto'
import { NearbyRouteResponseDto } from './dto/nearby-route-response.dto'
import { ListRoutesResponseDto, RouteResponseDto } from './dto/list-routes-response.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { readUploadedGpx, UploadedGpxFile } from './gpx-upload.util'

@ApiTags('routes')
@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name)

  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ operationId: 'importGpx' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportRouteUploadDto })
  @ApiCreatedResponse({ type: ImportRouteResultDto, description: 'The imported route' })
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
}
