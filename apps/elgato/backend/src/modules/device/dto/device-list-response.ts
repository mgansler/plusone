import { ApiProperty } from '@nestjs/swagger'

import { DeviceResponseDto } from './device-response'

export class DeviceListResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: Array<DeviceResponseDto>
}
