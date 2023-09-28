import { ApiProperty } from '@nestjs/swagger'

import { RoomResponseDto } from './room-response.dto'

export class RoomListResponseDto {
  @ApiProperty({ type: [RoomResponseDto] })
  rooms: RoomResponseDto[]
}
