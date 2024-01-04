import { ApiProperty } from '@nestjs/swagger'

export class DeviceResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty({ deprecated: true })
  name: string

  @ApiProperty()
  displayName: string
}
