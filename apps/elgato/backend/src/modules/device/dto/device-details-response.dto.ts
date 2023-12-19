import { ApiProperty } from '@nestjs/swagger'

import { DeviceState } from './device-state'
import { DeviceWithGroupResponseDto } from './device-with-group-response.dto'
import { ElgatoDeviceDetailsResponseDto } from './elgato-device-details-response.dto'

export class DeviceDetailsResponseDto extends DeviceWithGroupResponseDto {
  @ApiProperty({ type: () => ElgatoDeviceDetailsResponseDto })
  details: ElgatoDeviceDetailsResponseDto

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState

  @ApiProperty()
  lastSeen: Date
}
