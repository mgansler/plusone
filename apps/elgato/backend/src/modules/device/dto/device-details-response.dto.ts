import { ApiProperty } from '@nestjs/swagger'

import { DeviceResponseDto } from './device-response'
import { DeviceState } from './device-state'
import { ElgatoDeviceDetailsResponseDto } from './elgato-device-details-response.dto'

export class DeviceDetailsResponseDto extends DeviceResponseDto {
  @ApiProperty({ type: () => ElgatoDeviceDetailsResponseDto })
  details: ElgatoDeviceDetailsResponseDto

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState

  @ApiProperty()
  lastSeen: Date
}
