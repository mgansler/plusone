import { ApiProperty } from '@nestjs/swagger'

import { DevicePowerState } from '../../device/enum/device-power-state'

export class GroupStateInputDto {
  @ApiProperty({ enum: DevicePowerState, enumName: 'DevicePowerState' })
  desiredPowerState: DevicePowerState
}
