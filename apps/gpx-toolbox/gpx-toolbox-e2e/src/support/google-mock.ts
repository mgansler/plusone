import { createHash, createSign, generateKeyPairSync, randomBytes } from 'node:crypto'
import { createServer, type IncomingMessage, type Server } from 'node:http'

export const GOOGLE_CLIENT_ID = 'e2e-google-client'
export const GOOGLE_CLIENT_SECRET = 'e2e-google-secret'

export type GoogleUser = { sub: string; name: string; email: string }

export const GOOGLE_USER: GoogleUser = { sub: 'google-max', name: 'Max Beispiel', email: 'max@example.com' }
export const OTHER_GOOGLE_USER: GoogleUser = { sub: 'google-berta', name: 'Berta Beispiel', email: 'berta@example.com' }

const KEY_ID = 'e2e-key'

/** Who signs in on the Google page next, `null` is a user who declines */
let nextUser: GoogleUser | null = GOOGLE_USER

/** Set the user the next login signs in as (`null`: the user declines on the Google page) */
export function setGoogleUser(user: GoogleUser | null): null {
  nextUser = user
  return null
}

/** Back to the default user, call between tests */
export function resetGoogleMock(): null {
  return setGoogleUser(GOOGLE_USER)
}

type IssuedCode = { user: GoogleUser; nonce: string; codeChallenge: string; redirectUri: string }

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url')

async function readForm(req: IncomingMessage): Promise<URLSearchParams> {
  const chunks: Array<Buffer> = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return new URLSearchParams(Buffer.concat(chunks).toString('utf-8'))
}

/**
 * Minimal stand-in for Google's OpenID Connect endpoints used by the login: discovery, authorization (the user
 * agrees without a page), token (checks client credentials and the PKCE verifier, issues a signed ID token)
 * and the signing keys. The backend is pointed at it with GOOGLE_DISCOVERY_URL, so the end-to-end tests never
 * talk to the real Google.
 */
export function startGoogleMock(port: number): Promise<Server> {
  const baseUrl = `http://localhost:${port}`
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KEY_ID, alg: 'RS256', use: 'sig' }
  const issuedCodes = new Map<string, IssuedCode>()

  function idToken(user: GoogleUser, nonce: string): string {
    const now = Math.floor(Date.now() / 1000)
    const claims = {
      iss: baseUrl,
      aud: GOOGLE_CLIENT_ID,
      sub: user.sub,
      iat: now,
      exp: now + 3600,
      nonce,
      email: user.email,
      email_verified: true,
      name: user.name,
    }
    const data = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: KEY_ID }))}.${base64url(JSON.stringify(claims))}`
    return `${data}.${base64url(createSign('RSA-SHA256').update(data).sign(privateKey))}`
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', baseUrl)
    const json = (status: number, body: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }

    if (url.pathname === '/.well-known/openid-configuration') {
      return json(200, {
        issuer: baseUrl,
        authorization_endpoint: `${baseUrl}/authorize`,
        token_endpoint: `${baseUrl}/token`,
        jwks_uri: `${baseUrl}/jwks`,
      })
    }

    if (url.pathname === '/jwks') return json(200, { keys: [jwk] })

    // The user agrees (or declines) on the Google page and is sent back with a code
    if (url.pathname === '/authorize') {
      const params = url.searchParams
      const redirectUri = params.get('redirect_uri') ?? ''
      if (
        params.get('client_id') !== GOOGLE_CLIENT_ID ||
        params.get('response_type') !== 'code' ||
        params.get('code_challenge_method') !== 'S256' ||
        !params.get('code_challenge') ||
        !params.get('nonce') ||
        !URL.canParse(redirectUri)
      ) {
        return json(400, { error: 'invalid_request' })
      }

      const callback = new URL(redirectUri)
      callback.searchParams.set('state', params.get('state') ?? '')
      if (nextUser) {
        const code = randomBytes(8).toString('hex')
        issuedCodes.set(code, {
          user: nextUser,
          nonce: params.get('nonce') ?? '',
          codeChallenge: params.get('code_challenge') ?? '',
          redirectUri,
        })
        callback.searchParams.set('code', code)
      } else {
        callback.searchParams.set('error', 'access_denied')
      }
      res.writeHead(302, { Location: callback.toString() })
      return res.end()
    }

    if (url.pathname === '/token' && req.method === 'POST') {
      const form = await readForm(req)
      const issued = issuedCodes.get(form.get('code') ?? '')
      issuedCodes.delete(form.get('code') ?? '')

      const pkceMatches =
        issued &&
        createHash('sha256')
          .update(form.get('code_verifier') ?? '')
          .digest('base64url') === issued.codeChallenge
      if (
        !issued ||
        !pkceMatches ||
        form.get('grant_type') !== 'authorization_code' ||
        form.get('client_id') !== GOOGLE_CLIENT_ID ||
        form.get('client_secret') !== GOOGLE_CLIENT_SECRET ||
        form.get('redirect_uri') !== issued.redirectUri
      ) {
        return json(400, { error: 'invalid_grant' })
      }

      return json(200, {
        access_token: 'e2e-google-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: idToken(issued.user, issued.nonce),
      })
    }

    json(404, { error: 'not_found', path: url.pathname })
  })

  return new Promise((resolve) => {
    // Does not keep Cypress alive after the run
    server.listen(port, () => resolve(server)).unref()
  })
}
