import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceService } from './device.service'
import { DeviceAssignToRoomInputDto } from './dto/device-assign-to-room-input.dto'
import { DeviceDetailsResponseDto } from './dto/device-details-response.dto'
import { DeviceListResponseDto } from './dto/device-list-response'

@Controller()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiOperation({ operationId: 'device-list' })
  @ApiOkResponse({ description: 'List of all devices in the local network.', type: DeviceListResponseDto })
  @Get('/devices')
  async getDevices(): Promise<DeviceListResponseDto> {
    const devices = await this.deviceService.getAllDevices()
    return { devices }
  }

  @ApiOperation({ operationId: 'device-details' })
  @ApiOkResponse({
    description: 'Detailed information for the device with the given id.',
    type: DeviceDetailsResponseDto,
  })
  @Get('/devices/:id')
  async getDevice(@Param('id') id: string): Promise<DeviceDetailsResponseDto> {
    return this.deviceService.getDevice(id)
  }

  @ApiOperation({ operationId: 'toggle-device' })
  @Put('/devices/:id/toggle')
  async toggleDevice(@Param('id') id: string) {
    return this.deviceService.toggle(id)
  }

  @ApiOperation({ operationId: 'assign-device-to-room' })
  @Put('/devices/:id/assign-to-room')
  async assignDeviceToRoom(@Param('id') id: string, @Body() assignDeviceToRoomInputDto: DeviceAssignToRoomInputDto) {
    return this.deviceService.assignDeviceToRoom(id, assignDeviceToRoomInputDto.roomId)
  }
}
