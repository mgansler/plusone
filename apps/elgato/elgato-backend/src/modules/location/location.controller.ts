import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { LocationDataResponseDto } from './dto/location-data-response.dto'
import { LocationResponseDto } from './dto/location-response.dto'
import { LocationUpdateRequestDto } from './dto/location-update-request.dto'
import { LocationService } from './location.service'

@ApiTags('internal', 'location')
@Controller('/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ operationId: 'update-location' })
  @ApiBody({ description: 'Information that describe a location.', type: LocationUpdateRequestDto })
  @Post('')
  async updateLocation(@Body() locationUpdateRequestDto: LocationUpdateRequestDto) {
    return this.locationService.updateLocation(locationUpdateRequestDto)
  }

  @ApiOperation({ operationId: 'current-location' })
  @ApiOkResponse({ type: LocationResponseDto })
  @Get('')
  async getLocation(): Promise<LocationResponseDto> {
    return this.locationService.getLocation()
  }

  @ApiOperation({ operationId: 'get-location-data' })
  @ApiOkResponse({ type: LocationDataResponseDto })
  @Get('location-data')
  async getLocationData(): Promise<LocationDataResponseDto> {
    return this.locationService.getLocationData()
  }
}
