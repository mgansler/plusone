import { Request } from 'express'

export const SESSION_COOKIE = 'trailcare_session'

/** Read the session token from the Cookie header without pulling in cookie-parser */
export function readSessionToken(request: Pick<Request, 'headers'>): string | undefined {
  const header = request.headers.cookie
  if (!header) {
    return undefined
  }

  for (const part of header.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) {
      continue
    }
    if (part.slice(0, separator).trim() === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(separator + 1).trim())
    }
  }

  return undefined
}
