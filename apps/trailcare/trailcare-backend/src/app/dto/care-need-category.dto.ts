import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CareNeedCategoryDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiPropertyOptional()
  description?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class CreateCareNeedCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string
}

export class UpdateCareNeedCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string
}
