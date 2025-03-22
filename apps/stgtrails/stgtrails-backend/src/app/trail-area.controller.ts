import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { CountryListResponseDto } from './dto/country-list-response.dto'
import { TrailAreaResponseDto } from './dto/trail-area-response.dto'
import { TrailResponseDto } from './dto/trail-response.dto'
import { TrailAreaService } from './trail-area.service'

@Controller('trailAreas')
@ApiTags('trail-area')
export class TrailAreaController {
  constructor(private readonly trailAreaService: TrailAreaService) {}

  @ApiOperation({ operationId: 'getCountries' })
  @ApiOkResponse({ type: [CountryListResponseDto] })
  @Get('/countries')
  async getCountries() {
    return this.trailAreaService.getCountries()
  }

  @ApiOperation({ operationId: 'getTrailAreas' })
  @ApiQuery({ name: 'country', description: 'Filter for country', type: String, required: false })
  @ApiQuery({ name: 'state', description: 'Filter for state', type: String, required: false })
  @ApiOkResponse({ type: [TrailAreaResponseDto] })
  @Get()
  async getTrailAreas(@Query('country') country: string, @Query('state') state: string) {
    return this.trailAreaService.getTrailAreas(country, state)
  }

  @ApiOperation({ operationId: 'getTrailsOfArea' })
  @ApiOkResponse({ type: [TrailResponseDto] })
  @Get(':trailAreaId/trails')
  async getTrailsOfArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.trailAreaService.getTrailsOfArea(trailAreaId)
  }
}
