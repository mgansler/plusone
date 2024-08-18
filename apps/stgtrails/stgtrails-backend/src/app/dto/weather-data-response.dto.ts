import { ApiProperty } from '@nestjs/swagger'

export class WeatherDataResponseDto {
  @ApiProperty()
  time: Date

  @ApiProperty()
  temperature2m: number

  @ApiProperty()
  rain: number

  @ApiProperty()
  soilMoisture0To1cm: number

  @ApiProperty()
  soilMoisture1To3cm: number

  @ApiProperty()
  soilMoisture3To9cm: number

  @ApiProperty()
  soilMoisture9To27cm: number
}
