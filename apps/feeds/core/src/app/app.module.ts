import { Module } from '@nestjs/common'

import { ArticleModule } from '@plusone/feeds/backend/article'
import { AuthenticationModule } from '@plusone/feeds/backend/authentication'
import { FeedModule } from '@plusone/feeds/backend/feed'
import { UserModule } from '@plusone/feeds/backend/user'
import { FeedsBackendSchedulingModule } from '@plusone/feeds/backend/scheduling'

@Module({
  imports: [ArticleModule, AuthenticationModule, FeedModule, UserModule, FeedsBackendSchedulingModule],
  providers: [],
})
export class AppModule {}
