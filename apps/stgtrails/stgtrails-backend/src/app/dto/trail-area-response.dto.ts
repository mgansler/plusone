import { ApiProperty } from '@nestjs/swagger'

export class TrailAreaResponseDto {
  @ApiProperty({ example: 5 })
  id: number

  @ApiProperty({ example: 'Whistler' })
  name: string

  @ApiProperty({ example: 50.113 })
  latitude: number

  @ApiProperty({ example: -122.954 })
  longitude: number

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.33 })
  threshold: number
}
