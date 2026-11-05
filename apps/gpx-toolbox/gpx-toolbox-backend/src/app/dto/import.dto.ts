import { ApiProperty } from '@nestjs/swagger'

export class ImportResultDto {
  @ApiProperty({ description: 'Number of routes/activities imported' })
  imported: number

  @ApiProperty({ description: 'Number matched to existing routes' })
  matched: number

  @ApiProperty({ description: 'Number of new routes created' })
  newRoutes: number
}
