import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PrismaService, Role } from '@plusone/trailcare-persistence'

import { TRAILCARE_ADMIN_PASSWORD, TRAILCARE_INITIAL_ACCESS_PASSWORD, ValidatedConfig } from '../config'

import { generatePassword, hashPassword, safeEqual, verifyPassword } from './password-hash'

export type LoginResult = { role: Role; accessPasswordId?: number }

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<ValidatedConfig, true>,
  ) {}

  async onModuleInit() {
    if (this.config.get(TRAILCARE_ADMIN_PASSWORD) === undefined) {
      const generated = generatePassword()
      this.config.set(TRAILCARE_ADMIN_PASSWORD, generated)
      this.logger.warn(`No ${TRAILCARE_ADMIN_PASSWORD} provided, using generated admin password '${generated}'`)
    }

    const initialPassword = this.config.get(TRAILCARE_INITIAL_ACCESS_PASSWORD)
    if (initialPassword !== undefined && (await this.prisma.accessPassword.count()) === 0) {
      await this.prisma.accessPassword.create({
        data: { label: 'Initial', passwordHash: await hashPassword(initialPassword) },
      })
      this.logger.log('Created initial access password')
    }
  }

  /** The admin password grants admin access, any access password grants user access */
  async login(password: string): Promise<LoginResult | null> {
    if (safeEqual(password, this.config.get(TRAILCARE_ADMIN_PASSWORD))) {
      return { role: Role.ADMIN }
    }

    const accessPasswords = await this.prisma.accessPassword.findMany({ select: { id: true, passwordHash: true } })
    for (const accessPassword of accessPasswords) {
      if (await verifyPassword(password, accessPassword.passwordHash)) {
        await this.prisma.accessPassword.update({
          where: { id: accessPassword.id },
          data: { lastUsedAt: new Date() },
        })
        return { role: Role.USER, accessPasswordId: accessPassword.id }
      }
    }

    return null
  }
}
