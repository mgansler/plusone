import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

import { ArticleService } from './article.service'
import { ArticleController } from './article.controller'

@Module({
  imports: [],
  controllers: [ArticleController],
  providers: [ArticleService, PrismaService],
  exports: [ArticleService],
})
export class ArticleModule {}
