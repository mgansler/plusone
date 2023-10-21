import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class LocationUpdateRequestDto {
  @ApiProperty()
  longitude: number

  @ApiProperty()
  latitude: number

  @ApiProperty()
  @IsString()
  name: string
}
