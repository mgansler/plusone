import { IsOptional, IsString, IsBoolean } from 'class-validator'
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'

export class ImportStravaRoutesDto {
  @ApiPropertyOptional({ description: 'Force re-import even if already imported' })
  @IsOptional()
  @IsBoolean()
  force?: boolean
}

export class ImportStravaActivityDto {
  @ApiProperty({ description: 'Strava activity ID' })
  @IsString()
  activityId: string

  @ApiPropertyOptional({ description: 'Auto-match to existing route' })
  @IsOptional()
  @IsBoolean()
  autoMatch?: boolean
}

export class ImportResultDto {
  @ApiProperty({ description: 'Number of routes/activities imported' })
  imported: number

  @ApiProperty({ description: 'Number matched to existing routes' })
  matched: number

  @ApiProperty({ description: 'Number of new routes created' })
  newRoutes: number
}
