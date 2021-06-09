package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Article
import de.martingansler.feeds.graphql.types.Feed
import de.martingansler.feeds.graphql.types.Group
import de.martingansler.feeds.service.ArticleService
import de.martingansler.feeds.service.FeedService
import de.martingansler.feeds.service.GroupService
import graphql.kickstart.tools.GraphQLResolver
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import kotlin.math.max
import kotlin.math.min

@Component
class FeedResolver(
    val articleService: ArticleService,
    val feedService: FeedService,
    val groupService: GroupService
) : GraphQLResolver<Feed> {
    fun articles(feed: Feed, unread: Boolean?, offset: Int?, limit: Int?): List<Article> =
        articleService.articlesForCurrentUser(
            feed = feed,
            unread = unread,
            pageRequest = PageRequest.of(sanitizeOffset(offset), sanitizeLimit(limit))
        ).map { Article(it.article, it.unread) }

    fun group(feed: Feed) =
        groupService.groupByFeedForCurrentUser(feed.id)?.let { Group(it) }

    fun unreadCount(feed: Feed): Int =
        feedService.unreadCountByFeedForCurrentUser(feed.id)

    fun totalCount(feed: Feed): Int =
        feedService.totalCountByFeedForCurrentUser(feed.id)

    companion object {
        @Suppress("MagicNumber")
        private fun sanitizeLimit(limit: Int?): Int = if (limit == null) 10 else min(limit, 20)

        @Suppress("MagicNumber")
        private fun sanitizeOffset(offset: Int?): Int = if (offset == null) 0 else max(offset, 0)
    }
}
