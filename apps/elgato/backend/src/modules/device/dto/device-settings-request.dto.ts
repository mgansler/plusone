import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class DeviceSettingsRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sunrise: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sunset: boolean
}
