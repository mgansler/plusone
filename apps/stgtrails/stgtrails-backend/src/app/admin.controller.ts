import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBasicAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { TrailAreaCreateFromCoordinatesDto } from './dto/trail-area-create-from-coordinates.dto'
import { TrailAreaCreateFromUrlDto } from './dto/trail-area-create-from-url.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { TrailUpdateDto } from './dto/trail-update.dto'
import { TrailAreaService } from './trail-area.service'
import { AdminAuthGuard } from './username-password.strategy'

@Controller('trailAreas')
@ApiTags('trail-area')
@UseGuards(AdminAuthGuard)
@ApiBasicAuth()
export class AdminController {
  constructor(private readonly trailAreaService: TrailAreaService) {}

  @ApiOperation({ operationId: 'createTrailAreaFromCoordinates' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  @Post('fromCoordinates')
  async createTrailAreaFromCoordinates(@Body() trailArea: TrailAreaCreateFromCoordinatesDto) {
    return this.trailAreaService.createTrailAreaFromCoordinates(trailArea)
  }

  @ApiOperation({ operationId: 'createTrailAreaFromUrl' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  @Post('fromUrl')
  async createTrailAreaFromUrl(@Body() trailArea: TrailAreaCreateFromUrlDto) {
    return this.trailAreaService.createTrailAreaFromUrl(trailArea)
  }

  @ApiOperation({ operationId: 'updateTrailArea' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  @Put(':trailAreaId')
  async updateTrailArea(
    @Param('trailAreaId', ParseIntPipe) trailAreaId: number,
    @Body() trailArea: TrailAreaUpdateDto,
  ) {
    return this.trailAreaService.updateTrailArea(trailAreaId, trailArea)
  }

  @ApiOperation({ operationId: 'createTrail' })
  @ApiOkResponse({ type: TrailResponseDto })
  @Post(':trailAreaId/trails')
  async createTrail(@Param('trailAreaId', ParseIntPipe) trailAreaId: number, @Body() trail: TrailCreateDto) {
    return this.trailAreaService.createTrail(trailAreaId, trail)
  }

  @ApiOperation({ operationId: 'deleteTrailArea' })
  @Delete(':trailAreaId')
  async deleteTrailArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.trailAreaService.deleteTrailArea(trailAreaId)
  }

  @ApiOperation({ operationId: 'updateTrail' })
  @Put('trails/:trailId')
  async updateTrail(@Param('trailId', ParseIntPipe) trailId: number, @Body() trail: TrailUpdateDto) {
    return this.trailAreaService.updateTrail(trailId, trail)
  }

  @ApiOperation({ operationId: 'deleteTrail' })
  @Delete('trails/:trailId')
  async deleteTrail(@Param('trailId', ParseIntPipe) trailId: number) {
    return this.trailAreaService.deleteTrail(trailId)
  }
}
