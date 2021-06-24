import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'

import { AuthenticationService } from './authentication.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LocalAuthGuard } from './local-auth.guard'
import { UserRegistrationDto } from './user.dto'

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() { user }) {
    return this.authenticationService.login(user)
  }

  @Post('register')
  async register(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.authenticationService.register(userRegistrationDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() { user }) {
    return user
  }
}
