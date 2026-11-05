import { createHash, randomBytes } from 'node:crypto'

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey } from 'jose'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, googleDiscoveryUrl, requireEnv } from './config'

/** Everything needed to run the authorization code flow against one OpenID Connect provider */
export type OidcProvider = {
  discoveryUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string
}

/** Values the callback needs to finish a login, they are kept in a cookie in the browser that started it */
export type OidcAuthorization = {
  authorizationUrl: string
  state: string
  nonce: string
  codeVerifier: string
}

/** The verified identity of a user at the provider */
export type OidcClaims = {
  /** Stable id of the user at the provider, the email can change */
  subject: string
  email: string | null
  emailVerified: boolean
  name: string | null
  picture: string | null
}

type DiscoveryDocument = {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  jwks_uri: string
}

type ProviderMetadata = { document: DiscoveryDocument; keys: JWTVerifyGetKey }

/** Google, configured from the environment */
export function googleProvider(): OidcProvider {
  return {
    discoveryUrl: googleDiscoveryUrl(),
    clientId: requireEnv(GOOGLE_CLIENT_ID),
    clientSecret: requireEnv(GOOGLE_CLIENT_SECRET),
    redirectUri: process.env[GOOGLE_REDIRECT_URI] ?? 'http://localhost:3333/api/auth/google/callback',
    scope: 'openid email profile',
  }
}

/**
 * Generic OpenID Connect client: authorization code flow with PKCE and ID token validation. Knows nothing
 * about users, which makes it reusable for further providers (e.g. Apple).
 */
@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name)
  private readonly metadata = new Map<string, Promise<ProviderMetadata>>()

  /**
   * Build the URL the browser is sent to, plus the random values (`state`, `nonce`, PKCE verifier) the caller
   * has to remember until the callback.
   */
  async buildAuthorization(provider: OidcProvider): Promise<OidcAuthorization> {
    const { document } = await this.getMetadata(provider)
    const state = randomBytes(16).toString('hex')
    const nonce = randomBytes(16).toString('hex')
    const codeVerifier = randomBytes(32).toString('base64url')

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      response_type: 'code',
      scope: provider.scope,
      state,
      nonce,
      code_challenge: createHash('sha256').update(codeVerifier).digest('base64url'),
      code_challenge_method: 'S256',
    })

    return { authorizationUrl: `${document.authorization_endpoint}?${params.toString()}`, state, nonce, codeVerifier }
  }

  /**
   * Exchange the authorization code from the callback for the user's verified identity.
   */
  async authenticate(
    provider: OidcProvider,
    code: string,
    codeVerifier: string,
    expectedNonce: string,
  ): Promise<OidcClaims> {
    const idToken = await this.exchangeCode(provider, code, codeVerifier)
    return this.verifyIdToken(provider, idToken, expectedNonce)
  }

  private async exchangeCode(provider: OidcProvider, code: string, codeVerifier: string): Promise<string> {
    const { document } = await this.getMetadata(provider)
    const response = await fetch(document.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: provider.redirectUri,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '(could not read response body)')
      this.logger.error(`Code exchange failed: ${response.status} ${response.statusText} — ${body.slice(0, 200)}`)
      throw new UnauthorizedException('Failed to exchange code for token')
    }

    const data = (await response.json()) as { id_token?: string }
    if (!data.id_token) throw new UnauthorizedException('No ID token in the token response')
    return data.id_token
  }

  private async verifyIdToken(provider: OidcProvider, idToken: string, expectedNonce: string): Promise<OidcClaims> {
    const { document, keys } = await this.getMetadata(provider)

    try {
      // Checks the signature, `exp`, the issuer and that the token was issued for our client
      const { payload } = await jwtVerify(idToken, keys, { issuer: document.issuer, audience: provider.clientId })

      if (payload.nonce !== expectedNonce) throw new Error('Nonce mismatch')
      if (!payload.sub) throw new Error('Missing subject')

      return {
        subject: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : null,
        // Google has sent this claim as a string in the past
        emailVerified: payload.email_verified === true || payload.email_verified === 'true',
        name: typeof payload.name === 'string' ? payload.name : null,
        picture: typeof payload.picture === 'string' ? payload.picture : null,
      }
    } catch (error) {
      this.logger.error(`ID token rejected: ${error instanceof Error ? error.message : error}`)
      throw new UnauthorizedException('Invalid ID token')
    }
  }

  /** Discovery document and signing keys of a provider, loaded once. A failed load is retried on the next call. */
  private getMetadata(provider: OidcProvider): Promise<ProviderMetadata> {
    let metadata = this.metadata.get(provider.discoveryUrl)
    if (!metadata) {
      metadata = this.loadMetadata(provider.discoveryUrl)
      this.metadata.set(provider.discoveryUrl, metadata)
      metadata.catch(() => this.metadata.delete(provider.discoveryUrl))
    }
    return metadata
  }

  private async loadMetadata(discoveryUrl: string): Promise<ProviderMetadata> {
    const response = await fetch(discoveryUrl)
    if (!response.ok) {
      throw new Error(`OpenID Connect discovery failed: ${response.status} ${response.statusText}`)
    }

    const document = (await response.json()) as DiscoveryDocument
    return { document, keys: createRemoteJWKSet(new URL(document.jwks_uri)) }
  }
}
