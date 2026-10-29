import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateRouteDto {
  @ApiPropertyOptional({ description: 'Route name (defaults to the GPX track name)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiPropertyOptional({ description: 'Route description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'Route source', enum: ['stravaRoute', 'stravaActivity', 'manualImport'] })
  @IsOptional()
  @IsEnum(['stravaRoute', 'stravaActivity', 'manualImport'])
  source?: 'stravaRoute' | 'stravaActivity' | 'manualImport'
}

export class UpdateRouteDto {
  @ApiPropertyOptional({ description: 'Route name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiPropertyOptional({ description: 'Route description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'Route status', enum: ['planned', 'ridden', 'foundOnline'] })
  @IsOptional()
  @IsEnum(['planned', 'ridden', 'foundOnline'])
  status?: 'planned' | 'ridden' | 'foundOnline'

  @ApiPropertyOptional({ description: 'Rating tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  ratingTags?: Array<string>

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string
}

export class QueryRouteDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(['planned', 'ridden', 'foundOnline'])
  status?: 'planned' | 'ridden' | 'foundOnline'

  @ApiPropertyOptional({ description: 'Filter by source' })
  @IsOptional()
  @IsEnum(['stravaRoute', 'stravaActivity', 'manualImport'])
  source?: 'stravaRoute' | 'stravaActivity' | 'manualImport'

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'distance' | 'elevationGain' | 'createdAt' | 'updatedAt'

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC'

  @ApiPropertyOptional({ description: 'Minimum distance in meters' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  minDistance?: number

  @ApiPropertyOptional({ description: 'Maximum distance in meters' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxDistance?: number

  @ApiPropertyOptional({ description: 'Minimum elevation gain in meters' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minElevation?: number

  @ApiPropertyOptional({ description: 'Maximum elevation gain in meters' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxElevation?: number

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(value, 10)
    return isNaN(n) ? 1 : n
  })
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({ description: 'Page size', default: 50 })
  @IsOptional()
  @Transform(({ value }) => {
    let n = parseInt(value, 10)
    if (isNaN(n)) n = 50
    return n < 1 ? 1 : n > 200 ? 200 : n
  })
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number
}

export class ImportGpxResponseDto {
  @ApiProperty({ description: 'Created route ID' })
  id: string

  @ApiProperty({ description: 'Route name' })
  name: string

  @ApiProperty({ description: 'Total distance in meters' })
  totalDistance: number

  @ApiProperty({ description: 'Elevation gain in meters' })
  elevationGain: number

  @ApiProperty({ description: 'Elevation loss in meters' })
  elevationLoss: number
}
