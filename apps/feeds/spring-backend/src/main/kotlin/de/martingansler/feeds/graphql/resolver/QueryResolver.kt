package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Article
import de.martingansler.feeds.graphql.types.ArticleFilterCriteria
import de.martingansler.feeds.graphql.types.Feed
import de.martingansler.feeds.graphql.types.Group
import de.martingansler.feeds.service.ArticleService
import de.martingansler.feeds.service.FeedService
import de.martingansler.feeds.service.GroupService
import graphql.kickstart.tools.GraphQLQueryResolver
import org.springframework.security.access.annotation.Secured
import org.springframework.stereotype.Component

@Component
class QueryResolver(
    val articleService: ArticleService,
    val feedService: FeedService,
    val groupService: GroupService
) : GraphQLQueryResolver {
    @Secured("ROLE_USER")
    fun articles(filterCriteria: ArticleFilterCriteria) =
        articleService.articlesFilteredForCurrentUser(filterCriteria).map { Article(it.article, it.unread) }

    @Secured("ROLE_USER")
    fun feeds(): List<Feed> =
        feedService.allFeedsForCurrentUser().map { Feed(it.feed) }

    @Secured("ROLE_USER")
    fun groups(): List<Group> =
        groupService.groupsForCurrentUser().map { Group(it) }
}
