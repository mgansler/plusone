import { ApiProperty } from '@nestjs/swagger'

export class ListRoutesResponseDto {
  @ApiProperty({ description: 'Total number of routes', example: 42 })
  total: number

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number

  @ApiProperty({ description: 'Items per page', example: 50 })
  limit: number

  @ApiProperty({ description: 'Total number of pages', example: 1 })
  totalPages: number

  @ApiProperty({ description: 'List of routes', type: 'array' })
  items: Array<RouteResponseDto>
}

export class RouteResponseDto {
  @ApiProperty({ description: 'Route ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string

  @ApiProperty({ description: 'Route name', example: 'Schwäbische Alb Tour' })
  name: string

  @ApiProperty({ description: 'Route description', required: false })
  description?: string | null

  @ApiProperty({ description: 'Route source', example: 'stravaRoute' })
  source: string

  @ApiProperty({ description: 'Route status', example: 'planned' })
  status: string

  @ApiProperty({ description: 'Rating tags', type: 'array', required: false })
  ratingTags?: Array<unknown>

  @ApiProperty({ description: 'Route notes', required: false })
  notes?: string | null

  @ApiProperty({ description: 'Route statistics', required: false })
  stats?: Record<string, unknown> | null

  @ApiProperty({ description: 'List of rides', type: 'array', required: false })
  activities?: Array<{
    id: string
    riddenAt: string
    duration: number | null
    avgHr: number | null
    maxHr: number | null
    notes: string | null
    weather: string | null
  }>

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string

  @ApiProperty({ description: 'Route polyline coordinates', required: false })
  polyline?: Array<{ lat: number; lng: number }>
}
