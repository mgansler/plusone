import { ApiProperty } from '@nestjs/swagger'

export class SunriseSunsetResponseDto {
  @ApiProperty()
  date: string

  @ApiProperty()
  sunrise: Date

  @ApiProperty()
  sunset: Date
}
