import { ApiProperty } from '@nestjs/swagger'

export class TrailAreaUpdateDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  latitude: number

  @ApiProperty()
  longitude: number

  @ApiProperty()
  threshold: number
}
