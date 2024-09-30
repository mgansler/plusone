import { ApiProperty } from '@nestjs/swagger'

export class TrailAreaResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  latitude: number

  @ApiProperty()
  longitude: number

  @ApiProperty()
  threshold: number
}
