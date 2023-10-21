import { ApiProperty } from '@nestjs/swagger'

import { DevicePowerState } from '../../device/device-power-state'

export class GroupStateInputDto {
  @ApiProperty({ enum: DevicePowerState, enumName: 'DevicePowerState' })
  desiredPowerState: DevicePowerState
}
