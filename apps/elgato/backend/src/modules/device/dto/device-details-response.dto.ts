import { ApiProperty } from '@nestjs/swagger'

import { DeviceDetails } from './device-details.dto'
import { DeviceState } from './device-state'
import { DeviceWithRoomResponseDto } from './device-with-room-response.dto'

export class DeviceDetailsResponseDto extends DeviceWithRoomResponseDto {
  @ApiProperty({ type: () => DeviceDetails })
  details: DeviceDetails

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState
}
