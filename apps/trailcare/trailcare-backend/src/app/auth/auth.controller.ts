import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'

import { TRAILCARE_LOGIN_ATTEMPTS_PER_MINUTE, TRAILCARE_SECURE_COOKIE, ValidatedConfig } from '../config'
import { LoginDto, SessionResponseDto } from '../dto/auth.dto'

import { CurrentSession, Public } from './auth.decorators'
import { AuthService } from './auth.service'
import { readSessionToken, SESSION_COOKIE } from './session-cookie'
import { ActiveSession, SessionService } from './session.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly config: ConfigService<ValidatedConfig, true>,
  ) {}

  @Public()
  @Get('session')
  @ApiOperation({ operationId: 'getSession' })
  @ApiOkResponse({ type: SessionResponseDto })
  getSession(@CurrentSession() session?: ActiveSession): SessionResponseDto {
    return session ? { authenticated: true, role: session.role } : { authenticated: false }
  }

  @Public()
  @Throttle({ default: { limit: () => Number(process.env[TRAILCARE_LOGIN_ATTEMPTS_PER_MINUTE]) || 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ operationId: 'login' })
  @ApiOkResponse({ type: SessionResponseDto })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response): Promise<SessionResponseDto> {
    const result = await this.authService.login(body.password)
    if (!result) {
      throw new UnauthorizedException('Falsches Passwort')
    }

    const { token, expiresAt } = await this.sessionService.createSession(result.role, result.accessPasswordId)
    response.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get(TRAILCARE_SECURE_COOKIE),
      expires: expiresAt,
      path: '/',
    })

    return { authenticated: true, role: result.role }
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ operationId: 'logout' })
  @ApiOkResponse({ type: SessionResponseDto })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<SessionResponseDto> {
    const token = readSessionToken(request)
    if (token) {
      await this.sessionService.deleteSession(token)
    }
    response.clearCookie(SESSION_COOKIE, { path: '/' })
    return { authenticated: false }
  }
}
