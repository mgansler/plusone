import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CoordinateDto {
  @ApiProperty({ description: 'Latitude in degrees', example: 48.8566 })
  @IsNumber()
  latitude: number

  @ApiProperty({ description: 'Longitude in degrees', example: 2.3522 })
  @IsNumber()
  longitude: number
}

export class BRouterRequestDto {
  @ApiProperty({
    description: 'Array of coordinate objects defining the route points',
    type: () => [CoordinateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  points: Array<CoordinateDto>

  @ApiProperty({
    description: 'BRouter routing profile',
    enum: ['fastbike', 'trekking', 'mtb-zossebart'],
    required: false,
    default: 'fastbike',
  })
  @IsOptional()
  @IsString()
  profile?: 'fastbike' | 'trekking' | 'mtb-zossebart'
}

export class BRouterResponseDto {
  @ApiProperty({
    description: 'GPX XML string of the calculated route',
    type: 'string',
  })
  @IsString()
  gpx: string
}

export class BRouterRouteDto {
  @ApiProperty({ description: 'GPX XML string of the route', type: 'string' })
  @IsString()
  gpx: string

  @ApiProperty({ description: 'Alternative index (0, 1, 2)', type: 'number' })
  @IsNumber()
  alternativeIdx: number
}

export class BRouterRoutesResponseDto {
  @ApiProperty({ type: () => [BRouterRouteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BRouterRouteDto)
  routes: Array<BRouterRouteDto>
}
