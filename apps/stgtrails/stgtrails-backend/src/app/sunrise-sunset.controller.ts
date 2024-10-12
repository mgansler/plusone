import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { SunriseSunsetResponseDto } from './dto/sunrise-sunset-response.dto'
import { SunriseSunsetService } from './sunrise-sunset.service'

@Controller('sunrise-sunset')
@ApiTags('sunrise-sunset')
export class SunriseSunsetController {
  constructor(private readonly sunriseSunsetService: SunriseSunsetService) {}

  @ApiOperation({ operationId: 'getSunriseSunsetForTrailArea' })
  @ApiQuery({ name: 'trailAreaId', type: Number, required: true })
  @ApiQuery({ name: 'days', type: Number, required: false })
  @ApiOkResponse({ type: [SunriseSunsetResponseDto] })
  @Get()
  async getSunriseSunsetForArea(
    @Query('trailAreaId', ParseIntPipe) trailAreaId: number,
    @Query('days', new DefaultValuePipe(4), ParseIntPipe) hours: number,
  ) {
    return this.sunriseSunsetService.getSunriseSunsetForTrailArea(trailAreaId, hours)
  }
}
