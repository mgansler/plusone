import { ApiProperty } from '@nestjs/swagger'

export class DeviceDetails {
  @ApiProperty()
  productName: string

  @ApiProperty()
  displayName: string
}
