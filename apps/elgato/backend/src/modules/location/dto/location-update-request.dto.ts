import { ApiProperty } from '@nestjs/swagger'

export class LocationUpdateRequestDto {
  @ApiProperty()
  longitude: number

  @ApiProperty()
  latitude: number

  @ApiProperty()
  name: string
}
