import { ApiProperty } from '@nestjs/swagger'

export class DeviceDetails {
  @ApiProperty()
  productName: string

  @ApiProperty()
  displayName: string
}

export class DeviceState {
  @ApiProperty()
  on: boolean
}

export class DeviceResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string
}

export class DeviceDetailsResponseDto extends DeviceResponseDto {
  @ApiProperty({ type: () => DeviceDetails })
  details: DeviceDetails

  @ApiProperty({ type: () => DeviceState })
  state: DeviceState
}

export class DeviceListResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[]
}
