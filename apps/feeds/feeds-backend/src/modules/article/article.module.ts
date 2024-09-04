import { Module } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

import { ArticleController } from './article.controller'
import { ArticleService } from './article.service'

@Module({
  imports: [],
  controllers: [ArticleController],
  providers: [ArticleService, PrismaService],
  exports: [ArticleService],
})
export class ArticleModule {}
