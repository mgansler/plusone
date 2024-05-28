import { calculateMD5Response, calculatePBKDF2Response } from './challenge-response'

describe('challenge-response', () => {
  it('should calculate MD5 hash correctly', () => {
    const actual = calculateMD5Response('1234567z', 'äbc')

    expect(actual).toBe('1234567z-9e224a41eeefa284df7bb0f26c2913e2')
  })

  it('should calculate PBKDF2 hash correctly', () => {
    const actual = calculatePBKDF2Response('2$10000$5a1711$2000$5A1722', '1example!')

    expect(actual).toBe('5A1722$1798a1672bca7c6463d6b245f82b53703b0f50813401b03e4045a5861e689adb')
  })

  it('should reject salt of odd length', () => {
    expect(() => {
      calculatePBKDF2Response('2$10000$5A171$2000$5A172', 'password')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: '5A171' has an odd length, only strings of even length are allowed.]`,
    )
  })

  it('should reject salts that are not hex numbers', () => {
    expect(() => {
      calculatePBKDF2Response('2$10000$5Z1711$2000$5A1722', 'password')
    }).toThrowErrorMatchingInlineSnapshot(`[Error: '5Z1711' is not a valid hex string.]`)
  })
})
