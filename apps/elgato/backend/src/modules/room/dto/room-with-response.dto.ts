import { ApiProperty } from '@nestjs/swagger'

import { DeviceDetailsResponseDto } from '../../device/dto/device-details-response.dto'

import { RoomResponseDto } from './room-response.dto'

export class RoomWithDevicesResponseDto extends RoomResponseDto {
  @ApiProperty({ type: [DeviceDetailsResponseDto] })
  devices: DeviceDetailsResponseDto[]
}
