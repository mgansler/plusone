import { ApiProperty } from '@nestjs/swagger'

export class DeviceState {
  @ApiProperty()
  on: boolean
}
