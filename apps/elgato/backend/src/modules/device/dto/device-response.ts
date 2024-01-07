import { ApiProperty } from '@nestjs/swagger'

export class DeviceResponseDto {
  @ApiProperty({ description: 'The unique id for the device is its mac address.' })
  macAddress: string

  @ApiProperty()
  displayName: string
}
