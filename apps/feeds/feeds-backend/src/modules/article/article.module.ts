import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { ArticleController } from './article.controller'
import { ArticleService } from './article.service'

@Module({
  imports: [PrismaModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
