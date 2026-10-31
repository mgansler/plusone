import { randomBytes, randomInt, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>

const KEY_LENGTH = 64
const SALT_LENGTH = 16

/** Hash a password with scrypt, result format: `scrypt:<salt>:<hash>` (hex) */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const hash = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = stored.split(':')
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) {
    return false
  }

  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(actual, expected)
}

/** Constant time comparison for plain text secrets (e.g. the admin password from the environment) */
export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
}

// No 0/O, 1/l/I to keep generated passwords easy to type on a phone
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

/** Generate a password like `k7dm-x2pq-hr4t` */
export function generatePassword(groups = 3, groupLength = 4): string {
  return Array.from({ length: groups }, () =>
    Array.from({ length: groupLength }, () => PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)]).join(''),
  ).join('-')
}
