import { createHash, randomBytes } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { PrismaService, Role } from '@plusone/trailcare-persistence'

const DAY_MS = 24 * 60 * 60 * 1000

export const SESSION_TTL_MS: Record<Role, number> = {
  // Trail crews should stay logged in on their phones
  [Role.USER]: 180 * DAY_MS,
  [Role.ADMIN]: 7 * DAY_MS,
}

export type ActiveSession = {
  id: string
  role: Role
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the token for the cookie, only its hash is stored */
  async createSession(role: Role, accessPasswordId?: number): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS[role])

    await this.prisma.session.create({ data: { id: hashToken(token), role, expiresAt, accessPasswordId } })
    await this.prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } })

    return { token, expiresAt }
  }

  async findSession(token: string): Promise<ActiveSession | null> {
    const session = await this.prisma.session.findUnique({ where: { id: hashToken(token) } })
    if (!session || session.expiresAt.getTime() < Date.now()) {
      return null
    }
    return { id: session.id, role: session.role }
  }

  async deleteSession(token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: hashToken(token) } })
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
