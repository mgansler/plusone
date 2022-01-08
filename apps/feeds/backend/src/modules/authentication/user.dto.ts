import { IsNotEmpty } from 'class-validator'

export class UserRegistrationDto {
  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  password: string
}
