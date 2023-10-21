import { ApiProperty } from '@nestjs/swagger'

export class DeviceSettingsResponseDto {
  @ApiProperty()
  sunrise: boolean

  @ApiProperty()
  sunset: boolean
}
