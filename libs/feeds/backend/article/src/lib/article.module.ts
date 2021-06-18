import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds/backend/persistence'

import { ArticleService } from './article.service'

@Module({
  imports: [],
  providers: [ArticleService, PrismaService],
  exports: [ArticleService],
})
export class ArticleModule {}
