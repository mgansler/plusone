import { ApiProperty } from '@nestjs/swagger'

import { LocationUpdateRequestDto } from './location-update-request.dto'

export class LocationDataResponseDto extends LocationUpdateRequestDto {
  @ApiProperty()
  sunrise: Date

  @ApiProperty()
  sunset: Date

  @ApiProperty({ type: Date, nullable: true })
  firstLight: Date | null

  @ApiProperty({ type: Date, nullable: true })
  lastLight: Date | null

  @ApiProperty()
  dawn: Date

  @ApiProperty()
  dusk: Date

  @ApiProperty()
  solarNoon: Date

  @ApiProperty()
  goldenHour: Date

  @ApiProperty({ description: 'Time between sunrise and sunset in seconds.' })
  dayLength: number

  @ApiProperty()
  timeZone: string

  @ApiProperty()
  utcOffset: number
}
