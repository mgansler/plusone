import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ImportResultDto {
  @ApiProperty({ description: 'Number of routes/activities imported' })
  imported: number

  @ApiProperty({ description: 'Number matched to existing routes' })
  matched: number

  @ApiProperty({ description: 'Number of new routes created' })
  newRoutes: number
}

/** The multipart form of an activity upload */
export class ImportActivityUploadDto {
  @ApiProperty({ description: 'The GPX file', type: 'string', format: 'binary' })
  file: Buffer

  @ApiPropertyOptional({ description: 'Activity title (defaults to the GPX track name)' })
  title?: string
}
