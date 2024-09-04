import { ApiProperty } from '@nestjs/swagger'

export class DeviceDisplayNameRequestDto {
  @ApiProperty()
  displayName: string
}
