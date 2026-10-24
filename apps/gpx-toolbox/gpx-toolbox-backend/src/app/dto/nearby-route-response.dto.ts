import { ApiProperty } from '@nestjs/swagger'

export class NearbyRouteResponseDto {
  @ApiProperty({ description: 'Route ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string

  @ApiProperty({ description: 'Route name', example: 'Schwäbische Alb Tour' })
  name: string

  @ApiProperty({ description: 'Distance in meters', example: 15000 })
  distance: number

  @ApiProperty({ description: 'Formatted distance', example: '15.0 km' })
  distanceKm: string

  @ApiProperty({ description: 'Route status', example: 'planned' })
  status: string

  @ApiProperty({ description: 'Route source', example: 'stravaRoute' })
  source: string

  @ApiProperty({ description: 'Route statistics', required: false })
  stats?: Record<string, unknown> | null
}
