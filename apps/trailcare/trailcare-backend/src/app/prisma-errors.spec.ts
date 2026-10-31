import { ConflictException, NotFoundException } from '@nestjs/common'

import { Prisma } from '@plusone/trailcare-persistence'

import { rethrowPrismaError } from './prisma-errors'

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('failed', { code, clientVersion: 'test' })
}

describe('rethrowPrismaError', () => {
  it('turns unique constraint violations into a conflict with the given message', () => {
    expect(() => rethrowPrismaError(prismaError('P2002'), 'gibt es schon')).toThrow(
      new ConflictException('gibt es schon'),
    )
  })

  it('turns missing records into not found', () => {
    expect(() => rethrowPrismaError(prismaError('P2025'), '')).toThrow(NotFoundException)
  })

  it('rethrows everything else unchanged', () => {
    const other = prismaError('P2003')
    expect(() => rethrowPrismaError(other, '')).toThrow(other)
    const plain = new Error('boom')
    expect(() => rethrowPrismaError(plain, '')).toThrow(plain)
  })
})
