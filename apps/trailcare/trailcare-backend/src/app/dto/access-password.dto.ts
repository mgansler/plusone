import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

export class AccessPasswordDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  label: string

  @ApiProperty({ description: 'Number of devices currently logged in with this password' })
  activeSessions: number

  @ApiPropertyOptional()
  lastUsedAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

/** Only returned right after creating or rotating, the plain password is never stored */
export class AccessPasswordWithSecretDto extends AccessPasswordDto {
  @ApiProperty()
  password: string
}

export class CreateAccessPasswordDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string

  @ApiPropertyOptional({ description: 'Generated when omitted' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password?: string
}

export class UpdateAccessPasswordDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string
}

export class RotateAccessPasswordDto {
  @ApiPropertyOptional({ description: 'Generated when omitted' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password?: string
}
