import { Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { mapProductNameToDeviceType } from '../../shared/map-product-name-to-device-type'

import { DeviceDiscoveryService } from './device-discovery.service'
import { DiscoveredDevicesResponseDto } from './dto/discovered-devices-response.dto'

@ApiTags('discovery')
@Controller('/discovery')
export class DeviceDiscoveryController {
  constructor(private readonly deviceDiscoveryService: DeviceDiscoveryService) {}

  @ApiOperation({ operationId: 'discovered-devices' })
  @ApiOkResponse({
    description: 'List of devices that have been discovered via bonjour at some point.',
    type: DiscoveredDevicesResponseDto,
  })
  @Get('/devices')
  async getDiscoveredDevices(): Promise<DiscoveredDevicesResponseDto> {
    const devices = await this.deviceDiscoveryService.getDiscoveredDevices()
    return {
      devices: devices.map((device) => ({ ...device, type: mapProductNameToDeviceType(device.productName) })),
    }
  }

  @ApiOperation({ operationId: 'add-discovered-device' })
  @Post('/add-by-id/:deviceId')
  async addDiscoveredDevice(@Param('deviceId') id: string) {
    await this.deviceDiscoveryService.addDiscoveredDevice(id)
  }

  @ApiOperation({ operationId: 'add-manual-device' })
  @Post('/add-by-address/:address')
  async addManualDevice(@Param('address') address: string) {
    await this.deviceDiscoveryService.addManualDevice(address)
  }
}
