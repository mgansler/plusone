import { createHash } from 'node:crypto'
import { createServer, IncomingMessage, Server } from 'node:http'
import { AddressInfo } from 'node:net'

import { UnauthorizedException } from '@nestjs/common'
import { exportJWK, generateKeyPair, JWK, SignJWT } from 'jose'

import { OidcProvider, OidcService } from './oidc.service'

const CLIENT_ID = 'test-client'
const KID = 'test-key'

type TokenEndpoint = (params: URLSearchParams) => { status: number; body: unknown }

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Array<Buffer> = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf-8')
}

/** Runs against a local stand-in for an OpenID Connect provider, so the real HTTP and signature handling is covered */
describe('OidcService', () => {
  let server: Server
  let baseUrl: string
  let provider: OidcProvider
  let privateKey: CryptoKey
  let jwk: JWK
  let discoveryFails = false
  let discoveryRequests = 0
  let tokenEndpoint: TokenEndpoint
  let tokenRequests: Array<URLSearchParams>
  let service: OidcService

  beforeAll(async () => {
    const pair = await generateKeyPair('RS256')
    privateKey = pair.privateKey
    jwk = { ...(await exportJWK(pair.publicKey)), kid: KID, alg: 'RS256', use: 'sig' }

    server = createServer(async (req, res) => {
      const json = (status: number, body: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(body))
      }

      if (req.url === '/.well-known/openid-configuration') {
        discoveryRequests++
        if (discoveryFails) return json(503, { error: 'unavailable' })
        return json(200, {
          issuer: baseUrl,
          authorization_endpoint: `${baseUrl}/authorize`,
          token_endpoint: `${baseUrl}/token`,
          jwks_uri: `${baseUrl}/jwks`,
        })
      }
      if (req.url === '/jwks') return json(200, { keys: [jwk] })
      if (req.url === '/token' && req.method === 'POST') {
        const params = new URLSearchParams(await readBody(req))
        tokenRequests.push(params)
        const { status, body } = tokenEndpoint(params)
        return json(status, body)
      }
      json(404, {})
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

    provider = {
      discoveryUrl: `${baseUrl}/.well-known/openid-configuration`,
      clientId: CLIENT_ID,
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3333/api/auth/test/callback',
      scope: 'openid email profile',
    }
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  beforeEach(() => {
    service = new OidcService()
    discoveryFails = false
    discoveryRequests = 0
    tokenRequests = []
    tokenEndpoint = () => ({ status: 500, body: {} })
  })

  /** An ID token as the provider would issue it, `claims` override the defaults */
  async function idToken(claims: Record<string, unknown> = {}) {
    const { aud, iss, nonce, exp, ...rest } = claims
    return new SignJWT({ nonce: nonce ?? 'nonce-1', email: 'test@example.com', email_verified: true, ...rest })
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .setSubject('sub-1')
      .setIssuer((iss as string) ?? baseUrl)
      .setAudience((aud as string) ?? CLIENT_ID)
      .setIssuedAt()
      .setExpirationTime((exp as string | number) ?? '1h')
      .sign(privateKey)
  }

  function respondWith(token: string) {
    tokenEndpoint = () => ({ status: 200, body: { id_token: token } })
  }

  describe('buildAuthorization', () => {
    it('builds the authorization URL with state, nonce and a PKCE challenge', async () => {
      const result = await service.buildAuthorization(provider)

      const url = new URL(result.authorizationUrl)
      expect(`${url.origin}${url.pathname}`).toBe(`${baseUrl}/authorize`)
      expect(Object.fromEntries(url.searchParams)).toEqual({
        client_id: CLIENT_ID,
        redirect_uri: provider.redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: result.state,
        nonce: result.nonce,
        code_challenge: createHash('sha256').update(result.codeVerifier).digest('base64url'),
        code_challenge_method: 'S256',
      })
    })

    it('uses fresh random values for every login', async () => {
      const first = await service.buildAuthorization(provider)
      const second = await service.buildAuthorization(provider)

      expect(first.state).toMatch(/^[0-9a-f]{32}$/)
      expect(first.nonce).toMatch(/^[0-9a-f]{32}$/)
      expect(first.codeVerifier.length).toBeGreaterThanOrEqual(43)
      expect(first.state).not.toBe(second.state)
      expect(first.nonce).not.toBe(second.nonce)
      expect(first.codeVerifier).not.toBe(second.codeVerifier)
    })

    it('loads the discovery document only once', async () => {
      await service.buildAuthorization(provider)
      await service.buildAuthorization(provider)

      expect(discoveryRequests).toBe(1)
    })

    it('retries the discovery after it failed', async () => {
      discoveryFails = true
      await expect(service.buildAuthorization(provider)).rejects.toThrow('discovery failed')

      discoveryFails = false
      await expect(service.buildAuthorization(provider)).resolves.toBeDefined()
    })
  })

  describe('authenticate', () => {
    it('exchanges the code (with the PKCE verifier) and returns the verified claims', async () => {
      respondWith(await idToken({ name: 'Test User', picture: 'https://example.com/avatar.jpg', email_verified: true }))

      const claims = await service.authenticate(provider, 'the-code', 'the-verifier', 'nonce-1')

      expect(claims).toEqual({
        subject: 'sub-1',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      })
      expect(Object.fromEntries(tokenRequests[0])).toEqual({
        grant_type: 'authorization_code',
        code: 'the-code',
        redirect_uri: provider.redirectUri,
        client_id: CLIENT_ID,
        client_secret: 'test-secret',
        code_verifier: 'the-verifier',
      })
    })

    it('returns null for claims the provider did not send', async () => {
      respondWith(
        await new SignJWT({ nonce: 'nonce-1' })
          .setProtectedHeader({ alg: 'RS256', kid: KID })
          .setSubject('sub-2')
          .setIssuer(baseUrl)
          .setAudience(CLIENT_ID)
          .setExpirationTime('1h')
          .sign(privateKey),
      )

      const claims = await service.authenticate(provider, 'c', 'v', 'nonce-1')

      expect(claims).toEqual({ subject: 'sub-2', email: null, emailVerified: false, name: null, picture: null })
    })

    it('accepts email_verified sent as a string', async () => {
      respondWith(await idToken({ email_verified: 'true' }))

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).resolves.toMatchObject({ emailVerified: true })
    })

    it('does not trust an email_verified of "false"', async () => {
      respondWith(await idToken({ email_verified: 'false' }))

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).resolves.toMatchObject({ emailVerified: false })
    })

    it.each([
      ['a nonce that was not issued for this login', () => idToken({ nonce: 'someone-elses' })],
      ['a token for another client', () => idToken({ aud: 'other-client' })],
      ['a token of another issuer', () => idToken({ iss: 'https://evil.example.com' })],
      ['an expired token', () => idToken({ exp: Math.floor(Date.now() / 1000) - 3600 })],
    ])('rejects %s', async (_, makeToken) => {
      respondWith(await makeToken())

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects a token that is not signed with the keys of the provider', async () => {
      const other = await generateKeyPair('RS256')
      respondWith(
        await new SignJWT({ nonce: 'nonce-1' })
          .setProtectedHeader({ alg: 'RS256', kid: KID })
          .setSubject('sub-1')
          .setIssuer(baseUrl)
          .setAudience(CLIENT_ID)
          .setExpirationTime('1h')
          .sign(other.privateKey),
      )

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects an unsigned token', async () => {
      const unsigned = [
        Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
        Buffer.from(
          JSON.stringify({ sub: 'sub-1', iss: baseUrl, aud: CLIENT_ID, nonce: 'nonce-1', exp: 4_000_000_000 }),
        ).toString('base64url'),
        '',
      ].join('.')
      respondWith(unsigned)

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects a token without subject', async () => {
      respondWith(
        await new SignJWT({ nonce: 'nonce-1' })
          .setProtectedHeader({ alg: 'RS256', kid: KID })
          .setIssuer(baseUrl)
          .setAudience(CLIENT_ID)
          .setExpirationTime('1h')
          .sign(privateKey),
      )

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects a code the provider does not accept', async () => {
      tokenEndpoint = () => ({ status: 400, body: { error: 'invalid_grant' } })

      await expect(service.authenticate(provider, 'bad', 'v', 'nonce-1')).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects a token response without ID token', async () => {
      tokenEndpoint = () => ({ status: 200, body: { access_token: 'only-access' } })

      await expect(service.authenticate(provider, 'c', 'v', 'nonce-1')).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })
})
