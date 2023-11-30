import { ApiProperty } from '@nestjs/swagger'

import { DeviceState } from './device-state'
import { DeviceWithGroupResponseDto } from './device-with-group-response.dto'
import { ElgatoDeviceDetailsDto } from './elgato-device-details.dto'

export class DeviceDetailsResponseDto extends DeviceWithGroupResponseDto {
  @ApiProperty({ type: () => ElgatoDeviceDetailsDto })
  details: ElgatoDeviceDetailsDto

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState

  @ApiProperty()
  lastSeen: Date
}
