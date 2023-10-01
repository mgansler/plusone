import { ApiProperty } from '@nestjs/swagger'

export class ElgatoDeviceDetailsDto {
  @ApiProperty()
  productName: string

  @ApiProperty()
  displayName: string
}
