import { readSessionToken, SESSION_COOKIE } from './session-cookie'

const withCookie = (cookie?: string) => ({ headers: { cookie } })

describe('readSessionToken', () => {
  it('returns undefined without cookies', () => {
    expect(readSessionToken(withCookie())).toBeUndefined()
    expect(readSessionToken(withCookie(''))).toBeUndefined()
  })

  it('finds the session cookie among others', () => {
    expect(readSessionToken(withCookie(`theme=dark; ${SESSION_COOKIE}=abc-123 ; other=x`))).toBe('abc-123')
  })

  it('decodes the value and keeps "=" inside it', () => {
    expect(readSessionToken(withCookie(`${SESSION_COOKIE}=a%2Fb=c`))).toBe('a/b=c')
  })

  it('does not match cookies that only start with the same name', () => {
    expect(readSessionToken(withCookie(`${SESSION_COOKIE}_old=nope; broken`))).toBeUndefined()
  })
})
