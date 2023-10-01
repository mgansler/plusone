import { ApiProperty } from '@nestjs/swagger'

import { DeviceState } from './device-state'
import { DeviceWithRoomResponseDto } from './device-with-room-response.dto'
import { ElgatoDeviceDetailsDto } from './elgato-device-details.dto'

export class DeviceDetailsResponseDto extends DeviceWithRoomResponseDto {
  @ApiProperty({ type: () => ElgatoDeviceDetailsDto })
  details: ElgatoDeviceDetailsDto

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState

  @ApiProperty()
  lastSeen: Date
}
