import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Article, DatabaseModule } from '@plusone/feeds/backend/database'

import { ArticleService } from './article.service'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Article])],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
