import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'

import { AuthenticationService } from './authentication.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LocalAuthGuard } from './local-auth.guard'
import { UserRegisterDto } from './user-register-dto'

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authenticationService.login(req.user)
  }

  @Post('register')
  async register(@Body() userRegisterDto: UserRegisterDto) {
    return this.authenticationService.register(userRegisterDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
