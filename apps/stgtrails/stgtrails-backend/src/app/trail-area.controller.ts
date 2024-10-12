import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { TrailAreaCreateDto } from './dto/trail-area-create.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailAreaUpdateDto } from './dto/trail-area-update.dto'
import { TrailCreateDto } from './dto/trail-create.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { TrailUpdateDto } from './dto/trail-update.dto'
import { TrailAreaService } from './trail-area.service'

@Controller('trailAreas')
@ApiTags('trail-area')
export class TrailAreaController {
  constructor(private readonly trailAreaService: TrailAreaService) {}

  @ApiOperation({ operationId: 'createTrailArea' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  @Post()
  async createTrailArea(@Body() trailArea: TrailAreaCreateDto) {
    return this.trailAreaService.createTrailArea(trailArea)
  }

  @ApiOperation({ operationId: 'getTrailAreas' })
  @ApiOkResponse({ type: [TrailAreaResponseDto] })
  @Get()
  async getTrailAreas() {
    return this.trailAreaService.getTrailAreas()
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

  @ApiOperation({ operationId: 'deleteTrailArea' })
  @Delete(':trailAreaId')
  async deleteTrailArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.trailAreaService.deleteTrailArea(trailAreaId)
  }

  @ApiOperation({ operationId: 'createTrail' })
  @ApiOkResponse({ type: TrailResponseDto })
  @Post(':trailAreaId/trails')
  async createTrail(@Param('trailAreaId', ParseIntPipe) trailAreaId: number, @Body() trail: TrailCreateDto) {
    return this.trailAreaService.createTrail(trailAreaId, trail)
  }

  @ApiOperation({ operationId: 'getTrailsOfArea' })
  @ApiOkResponse({ type: [TrailResponseDto] })
  @Get(':trailAreaId/trails')
  async getTrailsOfArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.trailAreaService.getTrailsOfArea(trailAreaId)
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
