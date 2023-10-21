import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { LocationDataResponseDto } from './dto/location-data-response.dto'
import { LocationUpdateRequestDto } from './dto/location-update-request.dto'
import { LocationService } from './location.service'

@Controller('/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ operationId: 'update-location' })
  @ApiBody({ description: 'Information that describe a location.', type: LocationUpdateRequestDto })
  @Post('')
  async updateLocation(@Body() locationUpdateRequestDto: LocationUpdateRequestDto) {
    return this.locationService.updateLocation(locationUpdateRequestDto)
  }

  @ApiOperation({ operationId: 'get-location-data' })
  @ApiOkResponse({ type: LocationDataResponseDto })
  @Get('')
  async getLocationData(): Promise<LocationDataResponseDto> {
    return this.locationService.getLocationData()
  }
}
