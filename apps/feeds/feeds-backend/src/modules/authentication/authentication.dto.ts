import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class LoginResponseDto {
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

export class UserResponseDto {
  @ApiPropertyOptional({ type: String })
  email?: string | null

  @ApiProperty()
  id: string

  @ApiProperty()
  isAdmin: boolean

  @ApiProperty()
  username: string
}
