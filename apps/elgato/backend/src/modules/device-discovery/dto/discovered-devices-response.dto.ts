import { ApiProperty } from '@nestjs/swagger'

import { DiscoveredDeviceResponseDto } from './discovered-device-response.dto'

export class DiscoveredDevicesResponseDto {
  @ApiProperty({ type: () => [DiscoveredDeviceResponseDto] })
  devices: Array<DiscoveredDeviceResponseDto>
}
