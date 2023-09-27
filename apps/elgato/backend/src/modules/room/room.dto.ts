import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

import { DeviceDetailsResponseDto } from '../device/device.dto'

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

export class RoomWithDevicesResponseDto extends RoomResponseDto {
  @ApiProperty({ type: [DeviceDetailsResponseDto] })
  devices: DeviceDetailsResponseDto[]
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
