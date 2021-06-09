import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'

import { UserRegisterDto } from '@plusone/feeds/backend/user'
import { User } from '@plusone/feeds/backend/database'

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
  async register(@Body() user: UserRegisterDto): Promise<Omit<User, 'password'>> {
    const { username, id } = await this.authenticationService.register(user)
    return { username, id }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
