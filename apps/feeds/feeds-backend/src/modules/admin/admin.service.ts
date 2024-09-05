import { Injectable } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

import { AdminStatsResponseDto } from './admin-stats.dto'

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStats(): Promise<AdminStatsResponseDto> {
    const [articleCount, feedCount, userCount] = await this.prismaService.$transaction([
      this.prismaService.article.count(),
      this.prismaService.feed.count(),
      this.prismaService.user.count(),
    ])

    return {
      articleCount,
      feedCount,
      userCount,
    }
  }
}
