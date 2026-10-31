import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'

import { SweepStatus } from '../sweep-status'

import { CareEntryDto } from './care-entry.dto'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)
const trimAll = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? value.map((item) => (typeof item === 'string' ? item.trim() : item)) : value

export class TrailDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  trailAreaId: number

  @ApiProperty()
  trailAreaName: string

  @ApiProperty({ type: [String] })
  aliases: Array<string>

  @ApiProperty()
  sweepGreenMaxDays: number

  @ApiProperty()
  sweepYellowMaxDays: number

  @ApiProperty({ enum: SweepStatus, enumName: 'SweepStatus' })
  sweepStatus: SweepStatus

  @ApiPropertyOptional()
  lastSweptAt?: Date

  @ApiPropertyOptional({ description: 'Calendar days since the last sweep, 0 = today' })
  daysSinceSwept?: number

  @ApiPropertyOptional({ type: CareEntryDto })
  lastCareEntry?: CareEntryDto
}

export class TrailAreaDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty({ type: [TrailDto] })
  trails: Array<TrailDto>
}

export class TrailAreaInputDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string
}

export class TrailAreaResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string
}

export class CreateTrailDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(trimAll)
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(100, { each: true })
  aliases?: Array<string>

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  sweepGreenMaxDays?: number

  @ApiPropertyOptional({ default: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  sweepYellowMaxDays?: number
}

export class UpdateTrailDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ description: 'Move the trail to another area' })
  @IsOptional()
  @IsInt()
  trailAreaId?: number

  @ApiPropertyOptional({ type: [String], description: 'Replaces all aliases' })
  @IsOptional()
  @Transform(trimAll)
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(100, { each: true })
  aliases?: Array<string>

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  sweepGreenMaxDays?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  sweepYellowMaxDays?: number
}
