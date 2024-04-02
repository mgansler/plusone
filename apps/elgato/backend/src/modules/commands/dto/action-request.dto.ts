import { ApiProperty } from '@nestjs/swagger'

import { DeviceState } from '../../device/dto/device-state'

export class ActionRequestDto extends DeviceState {
  @ApiProperty()
  powerOnly: boolean

  @ApiProperty()
  macAddress: string
}
