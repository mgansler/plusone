import { Body, Controller, Get, Logger, Param, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { DeviceSettingsService } from './device-settings.service'
import { DeviceSettingsRequestDto } from './dto/device-settings-request.dto'
import { DeviceSettingsResponseDto } from './dto/device-settings-response.dto'

@Controller('/devices/:id/settings')
export class DeviceSettingsController {
  private logger = new Logger(DeviceSettingsController.name)

  constructor(private readonly deviceSettingService: DeviceSettingsService) {}

  @ApiOperation({ operationId: 'current-device-settings' })
  @ApiOkResponse({ description: 'Returns current settings', type: DeviceSettingsResponseDto })
  @Get()
  async getSettings(@Param('id') id: string): Promise<DeviceSettingsResponseDto> {
    return this.deviceSettingService.getCurrentSettings(id)
  }

  @ApiOperation({ operationId: 'update-device-settings' })
  @ApiOkResponse({ description: 'Returns all current settings when successful.', type: DeviceSettingsResponseDto })
  @Patch()
  updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: DeviceSettingsRequestDto,
  ): Promise<DeviceSettingsResponseDto> {
    return this.deviceSettingService.updateSettings(id, updateSettingsDto)
  }
}
