import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateFahrtDto {
  @ApiProperty({ description: 'Date and time of the ride (ISO 8601)' })
  @IsDateString()
  riddenAt: string

  @ApiPropertyOptional({ description: 'Activity title' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number

  @ApiPropertyOptional({ description: 'Average heart rate' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(250)
  avgHr?: number

  @ApiPropertyOptional({ description: 'Maximum heart rate' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(250)
  maxHr?: number

  @ApiPropertyOptional({ description: 'Personal notes' })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ description: 'Weather conditions summary' })
  @IsOptional()
  @IsString()
  weather?: string
}

export class UpdateFahrtDto {
  @ApiPropertyOptional({ description: 'Activity title' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ description: 'Date and time of the ride (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  riddenAt?: string

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number

  @ApiPropertyOptional({ description: 'Average heart rate' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(250)
  avgHr?: number

  @ApiPropertyOptional({ description: 'Maximum heart rate' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(250)
  maxHr?: number

  @ApiPropertyOptional({ description: 'Personal notes' })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ description: 'Weather conditions summary' })
  @IsOptional()
  @IsString()
  weather?: string
}

export class QueryFahrtDto {
  @ApiPropertyOptional({ description: 'Filter by date range start' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({ description: 'Filter by date range end' })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional({ description: 'Sort field', default: 'riddenAt' })
  @IsOptional()
  @IsString()
  sortBy?: 'riddenAt' | 'duration' | 'avgHr' | 'createdAt'

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC'

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

export class FahrtRouteResponseDto {
  @ApiProperty({ description: 'Route ID' })
  id: string

  @ApiProperty({ description: 'Route name' })
  name: string

  @ApiPropertyOptional({ description: 'Route status' })
  status?: string

  @ApiPropertyOptional({ description: 'Route stats' })
  stats?: Record<string, unknown>
}

export class FahrtResponseDto {
  @ApiProperty({ description: 'Fahrt ID' })
  id: string

  @ApiProperty({ description: 'Route ID' })
  routeId: string

  @ApiProperty({ description: 'Ridden date and time' })
  riddenAt: Date

  @ApiPropertyOptional({ description: 'Activity title', type: String, nullable: true })
  title: string | null

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration: number | null

  @ApiPropertyOptional({ description: 'Average heart rate' })
  avgHr: number | null

  @ApiPropertyOptional({ description: 'Maximum heart rate' })
  maxHr: number | null

  @ApiPropertyOptional({ description: 'Personal notes' })
  notes: string | null

  @ApiPropertyOptional({ description: 'Weather conditions summary' })
  weather: string | null

  @ApiProperty({ description: 'Created at' })
  createdAt: Date

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date

  @ApiPropertyOptional({ description: 'Parent route', type: FahrtRouteResponseDto })
  route?: FahrtRouteResponseDto
}
