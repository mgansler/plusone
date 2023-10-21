import { ApiProperty } from '@nestjs/swagger'

import { ElgatoDeviceDetailsDto } from '../../elgato/dto/elgato-device-details.dto'

import { DeviceState } from './device-state'
import { DeviceWithGroupResponseDto } from './device-with-group-response.dto'

export class DeviceDetailsResponseDto extends DeviceWithGroupResponseDto {
  @ApiProperty({ type: () => ElgatoDeviceDetailsDto })
  details: ElgatoDeviceDetailsDto

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState

  @ApiProperty()
  lastSeen: Date
}
