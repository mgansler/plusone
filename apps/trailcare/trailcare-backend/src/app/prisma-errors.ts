import { ConflictException, NotFoundException } from '@nestjs/common'

import { Prisma } from '@plusone/trailcare-persistence'

/** Translate well known Prisma errors into HTTP errors */
export function rethrowPrismaError(error: unknown, conflictMessage: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException(conflictMessage)
    }
    if (error.code === 'P2025') {
      throw new NotFoundException()
    }
  }
  throw error
}
