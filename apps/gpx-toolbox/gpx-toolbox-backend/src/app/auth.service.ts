import { timingSafeEqual } from 'node:crypto'

import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { IdentityProvider, PrismaService } from '@plusone/gpx-toolbox-persistence'

import { googleProvider, OidcAuthorization, OidcClaims, OidcService } from './oidc.service'

/** Result of a successful login: the local user id plus the issued JWT */
type AuthenticatedUser = {
  userId: string
  jwtToken: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly oidcService: OidcService,
  ) {}

  /**
   * Start a Google login. The caller has to remember `state`, `nonce` and `codeVerifier` (cookie) and hand
   * them back in `loginWithGoogle` once Google redirects to the callback.
   */
  getGoogleAuthorization(): Promise<OidcAuthorization> {
    return this.oidcService.buildAuthorization(googleProvider())
  }

  /**
   * Finish a Google login: verify the identity and issue a JWT for the local user.
   */
  async loginWithGoogle(code: string, codeVerifier: string, nonce: string): Promise<AuthenticatedUser> {
    const claims = await this.oidcService.authenticate(googleProvider(), code, codeVerifier, nonce)
    return this.loginWithIdentity('google', claims)
  }

  /**
   * Find the user of an identity, or create the user on the first login, and issue a JWT.
   */
  private async loginWithIdentity(provider: IdentityProvider, claims: OidcClaims): Promise<AuthenticatedUser> {
    // An unverified address must not end up on the account
    const email = claims.emailVerified ? claims.email : null

    const identity = await this.prisma.identity.findUnique({
      where: { provider_subject: { provider, subject: claims.subject } },
      include: { user: true },
    })

    const user = identity
      ? await this.prisma.user.update({
          where: { id: identity.userId },
          // The provider is the source of the profile, keep what we have if it sends less
          data: {
            name: claims.name ?? identity.user.name,
            email: email ?? identity.user.email,
            avatarUrl: claims.picture ?? identity.user.avatarUrl,
          },
        })
      : await this.prisma.user.create({
          data: {
            name: claims.name,
            email,
            avatarUrl: claims.picture,
            identities: { create: { provider, subject: claims.subject, email } },
          },
        })

    if (!identity) this.logger.log(`Created user ${user.id} for ${provider} identity`)

    return { userId: user.id, jwtToken: this.jwtService.sign({ sub: user.id }) }
  }

  /**
   * Verify the OAuth state parameter returned by the provider against the one issued at the start of the
   * flow to prevent login CSRF. Both have to be present.
   */
  verifyState(state: string | undefined, expected: string | undefined): boolean {
    if (!state || !expected) return false
    const a = Buffer.from(state)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  }
}
