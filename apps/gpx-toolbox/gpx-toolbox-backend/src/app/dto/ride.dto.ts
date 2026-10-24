import { IsOptional, IsString, IsInt, IsDateString, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFahrtDto {
  @ApiProperty({ description: 'Date and time of the ride (ISO 8601)' })
  @IsDateString()
  riddenAt: string

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
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: 'Page size', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50
}

export class FahrtResponseDto {
  @ApiProperty({ description: 'Fahrt ID' })
  id: string

  @ApiProperty({ description: 'Route ID' })
  routeId: string

  @ApiProperty({ description: 'Ridden date and time' })
  riddenAt: Date

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
}
