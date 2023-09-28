import { ApiProperty } from '@nestjs/swagger'

import { DevicePowerState } from '../../device/device-power-state'

export class RoomStateInputDto {
  @ApiProperty({ enum: DevicePowerState, enumName: 'DevicePowerState' })
  desiredPowerState: DevicePowerState
}
