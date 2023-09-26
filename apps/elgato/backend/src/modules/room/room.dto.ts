import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

export class RoomResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string
}

export class RoomListResponseDto {
  @ApiProperty({ type: [RoomResponseDto] })
  rooms: RoomResponseDto[]
}

export class RoomCreateDto {
  @ApiProperty()
  @IsString()
  name: string
}

export class RoomStateInputDto {
  @ApiProperty()
  @IsBoolean()
  desiredState: boolean
}
