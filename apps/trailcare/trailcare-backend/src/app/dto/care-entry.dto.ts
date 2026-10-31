import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'

import { CareType } from '@plusone/trailcare-persistence'

export class CareEntryDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  trailId: number

  @ApiProperty({ enum: CareType, enumName: 'CareType' })
  type: CareType

  @ApiProperty()
  performedAt: Date

  @ApiPropertyOptional()
  comment?: string

  @ApiPropertyOptional()
  performedBy?: string

  @ApiProperty()
  createdAt: Date

  @ApiPropertyOptional({ description: 'Set when the current session may still undo this entry' })
  undoableUntil?: Date
}

export class CreateCareEntryDto {
  @ApiProperty({ enum: CareType, enumName: 'CareType' })
  @IsEnum(CareType)
  type: CareType

  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  performedAt?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  performedBy?: string
}

export class UpdateCareEntryDto {
  @ApiPropertyOptional({ enum: CareType, enumName: 'CareType' })
  @IsOptional()
  @IsEnum(CareType)
  type?: CareType

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  performedAt?: Date

  @ApiPropertyOptional({ description: 'Empty string removes the comment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string

  @ApiPropertyOptional({ description: 'Empty string removes the name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  performedBy?: string
}
