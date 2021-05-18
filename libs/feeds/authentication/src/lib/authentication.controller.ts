import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'

import { User, UserRegisterDto } from '@plusone/feeds/user'

import { AuthenticationService } from './authentication.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LocalAuthGuard } from './local-auth.guard'

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authenticationService.login(req.user)
  }

  @Post('register')
  async register(@Body() user: UserRegisterDto): Promise<User> {
    const { username } = await this.authenticationService.register(user)
    return { username }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
