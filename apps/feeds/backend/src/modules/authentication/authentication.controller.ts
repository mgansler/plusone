import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { LoginResponseDto, UserLoginDto, UserRegistrationDto, UserResponseDto } from './authentication.dto'
import { AuthenticationService } from './authentication.service'
import { JwtAccessTokenGuard, JwtRefreshTokenGuard } from './jwt.strategy'
import { LocalAuthGuard } from './username-password-strategy.service'

@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ description: 'The username and password of the user that wants to login.', type: UserLoginDto })
  @ApiCreatedResponse({ description: 'Tokens that can be used to access the other endpoints.', type: LoginResponseDto })
  login(@Req() { user }): Promise<LoginResponseDto> {
    return this.authenticationService.login(user)
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout')
  logout(@Req() { user }) {
    return this.authenticationService.logout(user)
  }

  @Post('register')
  @ApiCreatedResponse({ description: 'User information after registration.', type: UserResponseDto })
  register(@Body() userRegistrationDto: UserRegistrationDto): Promise<UserResponseDto> {
    return this.authenticationService.register(userRegistrationDto)
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('profile')
  @ApiOkResponse({ description: 'User information.', type: UserResponseDto })
  getProfile(@Req() { user }): Promise<UserResponseDto> {
    return user
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  @ApiOkResponse({ description: 'Tokens that can be used to access the other endpoints.', type: LoginResponseDto })
  refresh(@Req() { user }): Promise<LoginResponseDto> {
    return this.authenticationService.login(user)
  }
}
