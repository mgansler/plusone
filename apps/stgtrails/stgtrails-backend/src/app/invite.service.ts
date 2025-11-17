import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { v7 } from 'uuid'

import { PrismaService } from '@plusone/stgtrails-persistence'

import { HOSTNAME, ValidatedConfig } from './config'
import { InviteResponseDto } from './dto/invite-response.dto'

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name)

  constructor(
    private readonly configService: ConfigService<ValidatedConfig, true>,
    private readonly prismaService: PrismaService,
  ) {}

  public async createNewInvite(name: string): Promise<InviteResponseDto> {
    this.logger.log(`Creating new invite for user: ${name}`)
    await this.prismaService.invite.create({
      data: {
        code: v7(),
        name,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      },
    })
    return { inviteUrl: this.configService.get(HOSTNAME) + '/api/invite/accept/' + v7() }
  }

  public acceptInvite(inviteId: string) {
    this.logger.log(`Accepting invite: ${inviteId}`)
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async invalidateExpiredInvites() {
    this.logger.log('Invalidating expired invites')
    // await this.prismaService.invite.updateMany({ data: { expired: true }, where: { expiresAt: { lt: new Date() } } })
  }
}
