import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export enum DevicePowerState {
  on = 'on',
  off = 'off',
}

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
  @ApiProperty({ enum: DevicePowerState, enumName: 'DevicePowerState' })
  desiredPowerState: DevicePowerState
}
