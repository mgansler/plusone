import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

import { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'

export class LoginResponseDto implements LoginResponse {
  @ApiProperty()
  access_token: string

  @ApiProperty()
  refresh_token: string
}

export class UserLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}

export class UserRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}

export class UserResponseDto implements UserResponse {
  @ApiPropertyOptional()
  email?: string

  @ApiProperty()
  id: string

  @ApiProperty()
  isAdmin: boolean

  @ApiProperty()
  username: string
}
