import { ApiProperty } from '@nestjs/swagger'

export class TrailResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  trailAreaId: number
}
