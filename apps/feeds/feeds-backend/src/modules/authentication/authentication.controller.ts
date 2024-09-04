import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { LoginResponseDto, UserLoginDto, UserRegistrationDto, UserResponseDto } from './authentication.dto'
import { AuthenticationService } from './authentication.service'
import { JwtAccessTokenGuard, JwtRefreshTokenGuard } from './jwt.strategy'
import { LocalAuthGuard } from './username-password-strategy.service'

@ApiTags('authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ operationId: 'login' })
  @ApiBody({ description: 'The username and password of the user that wants to login.', type: UserLoginDto })
  @ApiCreatedResponse({ description: 'Tokens that can be used to access the other endpoints.', type: LoginResponseDto })
  @Post('login')
  login(@Req() { user }): Promise<LoginResponseDto> {
    return this.authenticationService.login(user)
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout')
  @ApiOperation({ operationId: 'logout' })
  @ApiBearerAuth()
  logout(@Req() { user }) {
    return this.authenticationService.logout(user)
  }

  @Post('register')
  @ApiOperation({ operationId: 'register' })
  @ApiCreatedResponse({ description: 'User information after registration.', type: UserResponseDto })
  register(@Body() userRegistrationDto: UserRegistrationDto): Promise<UserResponseDto> {
    return this.authenticationService.register(userRegistrationDto)
  }

  @UseGuards(JwtAccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'profile' })
  @ApiOkResponse({ description: 'User information.', type: UserResponseDto })
  @Get('profile')
  getProfile(@Req() { user }): Promise<UserResponseDto> {
    return user
  }

  @UseGuards(JwtRefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'refresh' })
  @ApiOkResponse({ description: 'Tokens that can be used to access the other endpoints.', type: LoginResponseDto })
  @Get('refresh')
  refresh(@Req() { user }): Promise<LoginResponseDto> {
    return this.authenticationService.login(user)
  }
}
