import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

import { DeviceService } from './device.service'
import { DeviceDetailsResponseDto } from './dto/device-details-response.dto'
import { DeviceDisplayNameRequestDto } from './dto/device-display-name-request.dto'
import { DeviceListResponseDto } from './dto/device-list-response'
import { DevicePowerStateRequestDto } from './dto/device-power-state-request.dto'
import { TransitionToColorRequestDto } from './dto/transition-to-color-request.dto'

@Controller('/devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiOperation({ operationId: 'device-list' })
  @ApiOkResponse({ description: 'List of all devices in the local network.', type: DeviceListResponseDto })
  @Get('')
  async getDevices(): Promise<DeviceListResponseDto> {
    const devices = await this.deviceService.getAllDevices()
    return { devices }
  }

  @ApiOperation({ operationId: 'device-details' })
  @ApiOkResponse({
    description: 'Detailed information for the device with the given id.',
    type: DeviceDetailsResponseDto,
  })
  @Get('/:macAddress')
  async getDevice(@Param('macAddress') macAddress: string): Promise<DeviceDetailsResponseDto> {
    return this.deviceService.getDevice(macAddress)
  }

  @ApiOperation({ operationId: 'set-display-name' })
  @Put('/:macAddress/display-name')
  async setDisplayName(@Param('macAddress') macAddress: string, @Body() displayName: DeviceDisplayNameRequestDto) {
    return this.deviceService.setDisplayName(macAddress, displayName)
  }

  @ApiOperation({ operationId: 'toggle-device' })
  @Put('/:macAddress/toggle')
  async toggleDevice(@Param('macAddress') macAddress: string) {
    return this.deviceService.toggle(macAddress)
  }

  @ApiOperation({ operationId: 'device-set-power-state' })
  @Put('/:macAddress/power-state')
  async powerState(@Param('macAddress') macAddress: string, @Body() targetPowerState: DevicePowerStateRequestDto) {
    return this.deviceService.setPowerState(macAddress, targetPowerState)
  }

  @Throttle({ default: { limit: 1, ttl: 1_100 } })
  @ApiOperation({ operationId: 'transition-to-color' })
  @Put('/:macAddress/transition-to-color')
  async transitionToColor(@Param('macAddress') macAddress: string, @Body() color: TransitionToColorRequestDto) {
    return this.deviceService.transitionToColor(macAddress, color)
  }
}
