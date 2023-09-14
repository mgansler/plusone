import { ApiProperty } from '@nestjs/swagger'

export class DeviceResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string
}

export class DeviceListResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[]
}
