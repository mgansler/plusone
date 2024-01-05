import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class LocationResponseDto {
  @ApiProperty()
  longitude: number

  @ApiProperty()
  latitude: number

  @ApiProperty()
  @IsString()
  name: string
}
