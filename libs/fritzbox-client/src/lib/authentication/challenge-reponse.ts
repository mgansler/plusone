import { createHash, pbkdf2Sync } from 'node:crypto'

function parseHexToIntArray(hexNumber: string): Uint8Array {
  if (hexNumber.length % 2 !== 0) {
    throw new Error(`'${hexNumber}' has an odd length, only strings of even length are allowed.`)
  }

  const match = hexNumber.match(/[0-9a-fA-F]{2}/g)
  // We need to check the length here because `5Z1711` would be matched to `['17', '11']`
  if (match === null || match.length !== hexNumber.length / 2) {
    throw new Error(`'${hexNumber}' is not a valid hex string.`)
  }

  return new Uint8Array(match.map((value) => parseInt(value, 16)))
}

export function calculateMD5Response(challenge: string, password: string): string {
  const hash = createHash('md5')
    .update(Buffer.from(`${challenge}-${password}`, 'utf16le'))
    .digest('hex')

  return `${challenge}-${hash}`
}

export function calculatePBKDF2Response(challenge: string, password: string): string {
  const [, iter1, salt1, iter2, salt2] = challenge.split('$')

  const hash1 = pbkdf2Sync(password, parseHexToIntArray(salt1), Number(iter1), 32, 'sha256')
  const response = pbkdf2Sync(hash1, parseHexToIntArray(salt2), Number(iter2), 32, 'sha256').toString('hex')

  return `${salt2}$${response}`
}
