import { ApiProperty } from '@nestjs/swagger'

export class AdminStatsResponseDto {
  @ApiProperty()
  feedCount: number

  @ApiProperty()
  articleCount: number

  @ApiProperty()
  userCount: number
}
