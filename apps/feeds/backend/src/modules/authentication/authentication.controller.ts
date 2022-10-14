import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'

import { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'

import { AuthenticationService } from './authentication.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LocalAuthGuard } from './local-auth.guard'
import { UserRegistrationDto } from './user.dto'

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() { user }): Promise<LoginResponse> {
    return this.authenticationService.login(user)
  }

  @Post('register')
  register(@Body() userRegistrationDto: UserRegistrationDto): Promise<UserResponse> {
    return this.authenticationService.register(userRegistrationDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() { user }): Promise<UserResponse> {
    return user
  }
}
