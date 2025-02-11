import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { TrailAreaService } from './trail-area.service'

@Controller('trailAreas')
@ApiTags('trail-area')
export class TrailAreaController {
  constructor(private readonly trailAreaService: TrailAreaService) {}

  @ApiOperation({ operationId: 'getTrailAreas' })
  @ApiOkResponse({ type: [TrailAreaResponseDto] })
  @Get()
  async getTrailAreas() {
    return this.trailAreaService.getTrailAreas()
  }

  @ApiOperation({ operationId: 'getTrailsOfArea' })
  @ApiOkResponse({ type: [TrailResponseDto] })
  @Get(':trailAreaId/trails')
  async getTrailsOfArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.trailAreaService.getTrailsOfArea(trailAreaId)
  }
}
