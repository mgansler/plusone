import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { AuthService } from './auth.service'
import { JwtPayload } from './jwt.strategy'

/** Holds what the Google callback needs to finish a login, kept in the browser that started it */
const GOOGLE_COOKIE = 'gpx_toolbox_oauth'
const COOKIE_PATH = '/api/auth'
const COOKIE_MAX_AGE_MS = 10 * 60 * 1000

/** Values of a started Google login, see `OidcAuthorization` */
type PendingGoogleLogin = { state: string; nonce: string; codeVerifier: string }

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('google')
  @ApiOperation({ operationId: 'googleAuthRedirect' })
  @ApiOkResponse({ description: 'Redirects to the Google sign-in page' })
  async googleAuth(@Res({ passthrough: true }) res: Response) {
    const { authorizationUrl, state, nonce, codeVerifier } = await this.authService.getGoogleAuthorization()
    const pending: PendingGoogleLogin = { state, nonce, codeVerifier }
    // Remembered in the browser so the callback can check that it belongs to a login started here
    res.cookie(GOOGLE_COOKIE, Buffer.from(JSON.stringify(pending)).toString('base64url'), cookieOptions())
    res.redirect(authorizationUrl)
  }

  @Get('google/callback')
  @ApiOperation({ operationId: 'googleCallback' })
  @ApiQuery({ name: 'code', required: false, description: 'Google authorization code' })
  @ApiQuery({ name: 'state', required: false, description: 'OAuth state parameter' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { code, state, error } = req.query as { code?: string; state?: string; error?: string }

    const pending = readPendingGoogleLogin(readCookie(req.headers.cookie, GOOGLE_COOKIE))
    res.clearCookie(GOOGLE_COOKIE, { path: COOKIE_PATH })

    if (!pending || !this.authService.verifyState(state, pending.state)) {
      return res.status(401).json({ error: 'Invalid state parameter' })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4250'

    // E.g. the user declined on the Google page
    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' })
    }

    try {
      const { jwtToken } = await this.authService.loginWithGoogle(code, pending.codeVerifier, pending.nonce)

      // Redirect frontend with JWT in URL fragment (SPA-friendly)
      res.redirect(`${frontendUrl}#token=${jwtToken}`)
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        return res.status(401).json({ error: e.message })
      }
      res.status(500).json({ error: 'Authentication failed' })
    }
  }

  @Get('status')
  @ApiOperation({ operationId: 'authStatus' })
  @ApiOkResponse({ description: 'Authentication status' })
  async authStatus(@Req() req: Request) {
    try {
      const payload = this.verifyBearer(req)
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, avatarUrl: true },
      })

      // A valid JWT of a deleted user is not a valid login
      return user ? { authenticated: true, user } : { authenticated: false }
    } catch {
      return { authenticated: false }
    }
  }

  /** Verify the JWT from the Authorization header; an invalid or missing token is a 401, not a 500 */
  private verifyBearer(req: Request): JwtPayload {
    const token = req.headers['authorization']?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException('No access token provided')

    try {
      return this.jwtService.verify<JwtPayload>(token)
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }
  }
}

/** The cookie of the OAuth flow is only needed by the callback, so it is short-lived and scoped to the auth API */
function cookieOptions() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? ''
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: redirectUri.startsWith('https://'),
    path: COOKIE_PATH,
    maxAge: COOKIE_MAX_AGE_MS,
  } as const
}

/** Decode the cookie set by `googleAuth`; anything else (missing, tampered, truncated) is "no login started" */
function readPendingGoogleLogin(value: string | undefined): PendingGoogleLogin | undefined {
  if (!value) return undefined
  try {
    const pending = JSON.parse(Buffer.from(value, 'base64url').toString('utf-8')) as Partial<PendingGoogleLogin>
    return typeof pending.state === 'string' &&
      typeof pending.nonce === 'string' &&
      typeof pending.codeVerifier === 'string'
      ? { state: pending.state, nonce: pending.nonce, codeVerifier: pending.codeVerifier }
      : undefined
  } catch {
    return undefined
  }
}

/** Read a single cookie from the raw Cookie header */
function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return undefined
}
