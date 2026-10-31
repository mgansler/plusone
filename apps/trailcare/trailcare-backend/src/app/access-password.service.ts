import { Injectable, NotFoundException } from '@nestjs/common'

import { AccessPassword, PrismaService } from '@plusone/trailcare-persistence'

import { generatePassword, hashPassword } from './auth/password-hash'
import {
  AccessPasswordDto,
  AccessPasswordWithSecretDto,
  CreateAccessPasswordDto,
  RotateAccessPasswordDto,
  UpdateAccessPasswordDto,
} from './dto/access-password.dto'
import { rethrowPrismaError } from './prisma-errors'

type AccessPasswordWithCount = AccessPassword & { _count: { sessions: number } }

@Injectable()
export class AccessPasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Array<AccessPasswordDto>> {
    const passwords = await this.prisma.accessPassword.findMany({
      orderBy: { createdAt: 'asc' },
      include: this.sessionCount(),
    })
    return passwords.map(toDto)
  }

  async create(input: CreateAccessPasswordDto): Promise<AccessPasswordWithSecretDto> {
    const password = input.password ?? generatePassword()
    const created = await this.prisma.accessPassword.create({
      data: { label: input.label, passwordHash: await hashPassword(password) },
      include: this.sessionCount(),
    })
    return { ...toDto(created), password }
  }

  async updateLabel(id: number, input: UpdateAccessPasswordDto): Promise<AccessPasswordDto> {
    const updated = await this.prisma.accessPassword
      .update({ where: { id }, data: { label: input.label }, include: this.sessionCount() })
      .catch((error) => rethrowPrismaError(error, ''))
    return toDto(updated)
  }

  /** Sets a new password and logs out every device that used the old one */
  async rotate(id: number, input: RotateAccessPasswordDto): Promise<AccessPasswordWithSecretDto> {
    if ((await this.prisma.accessPassword.count({ where: { id } })) === 0) {
      throw new NotFoundException()
    }

    const password = input.password ?? generatePassword()
    const [, rotated] = await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { accessPasswordId: id } }),
      this.prisma.accessPassword.update({
        where: { id },
        data: { passwordHash: await hashPassword(password), lastUsedAt: null },
        include: this.sessionCount(),
      }),
    ])
    return { ...toDto(rotated), password }
  }

  async delete(id: number): Promise<void> {
    // Sessions are removed by the cascading relation
    await this.prisma.accessPassword.delete({ where: { id } }).catch((error) => rethrowPrismaError(error, ''))
  }

  private sessionCount() {
    return { _count: { select: { sessions: { where: { expiresAt: { gt: new Date() } } } } } } as const
  }
}

function toDto(password: AccessPasswordWithCount): AccessPasswordDto {
  return {
    id: password.id,
    label: password.label,
    activeSessions: password._count.sessions,
    lastUsedAt: password.lastUsedAt ?? undefined,
    createdAt: password.createdAt,
    updatedAt: password.updatedAt,
  }
}
