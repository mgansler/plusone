import { ApiProperty } from '@nestjs/swagger'

/**
 * {
 *   sunrise: '7:28:58 AM',
 *   sunset: '6:57:14 PM',
 *   first_light: '5:44:00 AM',
 *   last_light: '8:42:13 PM',
 *   dawn: '6:57:33 AM',
 *   dusk: '7:28:39 PM',
 *   solar_noon: '1:13:06 PM',
 *   golden_hour: '6:15:06 PM',
 *   day_length: '11:28:15',
 *   timezone: 'Europe/Berlin',
 *   utc_offset: 120
 * }
 */
class SunriseSunsetResults {
  @ApiProperty()
  sunrise: string

  @ApiProperty()
  sunset: string

  @ApiProperty()
  first_light: string

  @ApiProperty()
  last_light: string

  @ApiProperty()
  dawn: string

  @ApiProperty()
  dusk: string
  solar_noon: string

  @ApiProperty()
  golden_hour: string

  @ApiProperty()
  day_length: string

  @ApiProperty()
  timezone: string

  @ApiProperty()
  utc_offset: number
}

export class SunriseSunsetResponseDto {
  @ApiProperty()
  status: 'OK' | string

  @ApiProperty({ type: SunriseSunsetResults })
  results: SunriseSunsetResults
}
