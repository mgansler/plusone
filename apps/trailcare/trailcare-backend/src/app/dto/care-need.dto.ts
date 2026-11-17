import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class CareNeedCategoryRefDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiPropertyOptional()
  description?: string
}

export class CareNeedDto {
  @ApiProperty()
  id: number

  @ApiProperty({ type: () => CareNeedCategoryRefDto })
  category: CareNeedCategoryRefDto

  @ApiPropertyOptional()
  description?: string

  @ApiProperty()
  isDone: boolean

  @ApiPropertyOptional()
  doneAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class CreateCareNeedDto {
  @ApiProperty({ description: 'Category ID' })
  @IsInt()
  categoryId: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string
}

export class UpdateCareNeedDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number

  @ApiPropertyOptional({ description: 'Empty string removes the description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDone?: boolean
}
