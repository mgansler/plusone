import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

import { Role } from '@plusone/trailcare-persistence'

export class LoginDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  password: string
}

export class SessionResponseDto {
  @ApiProperty()
  authenticated: boolean

  @ApiProperty({ enum: Role, enumName: 'Role', required: false })
  role?: Role
}
