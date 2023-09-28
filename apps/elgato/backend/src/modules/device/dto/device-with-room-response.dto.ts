import { ApiProperty } from '@nestjs/swagger'

import { RoomResponseDto } from '../../room/dto/room-response.dto'

import { DeviceResponseDto } from './device-response'

export class DeviceWithRoomResponseDto extends DeviceResponseDto {
  @ApiProperty({ nullable: true, type: () => RoomResponseDto })
  room?: RoomResponseDto
}
