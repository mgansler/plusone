import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceService } from './device.service'
import { DeviceAddToGroupRequestDto } from './dto/device-add-to-group-request.dto'
import { DeviceDetailsResponseDto } from './dto/device-details-response.dto'
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
  @Get('/:id')
  async getDevice(@Param('id') id: string): Promise<DeviceDetailsResponseDto> {
    return this.deviceService.getDevice(id)
  }

  @ApiOperation({ operationId: 'toggle-device' })
  @Put('/:id/toggle')
  async toggleDevice(@Param('id') id: string) {
    return this.deviceService.toggle(id)
  }

  @ApiOperation({ operationId: 'device-set-power-state' })
  @Put('/:id/power-state')
  async powerState(@Param('id') id: string, @Body() targetPowerState: DevicePowerStateRequestDto) {
    return this.deviceService.setPowerState(id, targetPowerState)
  }

  @ApiOperation({ operationId: 'transition-to-color' })
  @Put('/:id/transition-to-color')
  async transitionToColor(@Param('id') id: string, @Body() color: TransitionToColorRequestDto) {
    return this.deviceService.transitionToColor(id, color)
  }

  @ApiOperation({ operationId: 'add-device-to-group' })
  @Put('/:id/add-to-group')
  async addDeviceToGroup(@Param('id') id: string, @Body() addToGroupInputDto: DeviceAddToGroupRequestDto) {
    return this.deviceService.addDeviceToGroup(id, addToGroupInputDto.groupId)
  }
}
