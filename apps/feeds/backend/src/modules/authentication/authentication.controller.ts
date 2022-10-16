import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'

import { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'

import { AuthenticationService } from './authentication.service'
import { JwtAccessTokenGuard, JwtRefreshTokenGuard } from './jwt.strategy'
import { UserRegistrationDto } from './user.dto'
import { LocalAuthGuard } from './username-password-strategy.service'

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() { user }): Promise<LoginResponse> {
    return this.authenticationService.login(user)
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout')
  logout(@Req() { user }) {
    return this.authenticationService.logout(user)
  }

  @Post('register')
  register(@Body() userRegistrationDto: UserRegistrationDto): Promise<UserResponse> {
    return this.authenticationService.register(userRegistrationDto)
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('profile')
  getProfile(@Req() { user }): Promise<UserResponse> {
    return user
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  refresh(@Req() { user }) {
    return this.authenticationService.login(user)
  }
}
