import { ApiProperty } from '@nestjs/swagger'

export class DeviceResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  displayName: string
}
