import { generatePassword, hashPassword, safeEqual, verifyPassword } from './password-hash'

describe('password-hash', () => {
  it('verifies the correct password only', async () => {
    const hash = await hashPassword('trailcrew')
    expect(hash).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/)
    expect(await verifyPassword('trailcrew', hash)).toBe(true)
    expect(await verifyPassword('Trailcrew', hash)).toBe(false)
  })

  it('salts every hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'))
  })

  it.each(['', 'plain', 'bcrypt:aa:bb', 'scrypt::'])('rejects malformed hash %j', async (stored) => {
    expect(await verifyPassword('anything', stored)).toBe(false)
  })

  it('compares plain secrets', () => {
    expect(safeEqual('admin', 'admin')).toBe(true)
    expect(safeEqual('admin', 'admi')).toBe(false)
    expect(safeEqual('admin', 'Admin')).toBe(false)
  })

  it('generates easy to type passwords', () => {
    const passwords = Array.from({ length: 50 }, () => generatePassword())
    for (const password of passwords) {
      expect(password).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/)
      expect(password).not.toMatch(/[01ilo]/)
    }
    expect(new Set(passwords).size).toBe(passwords.length)
    expect(generatePassword(2, 3)).toMatch(/^[a-z2-9]{3}-[a-z2-9]{3}$/)
  })
})
