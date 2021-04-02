package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Article
import de.martingansler.feeds.graphql.types.Feed
import de.martingansler.feeds.graphql.types.FeedInput
import de.martingansler.feeds.graphql.types.Group
import de.martingansler.feeds.graphql.types.GroupInput
import de.martingansler.feeds.service.ArticleService
import de.martingansler.feeds.service.FeedService
import de.martingansler.feeds.service.GroupService
import graphql.kickstart.tools.GraphQLMutationResolver
import org.springframework.security.access.annotation.Secured
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class MutationResolver(
    val articleService: ArticleService,
    val feedService: FeedService,
    val groupService: GroupService
) : GraphQLMutationResolver {

    @Secured("ROLE_USER")
    fun addFeed(input: FeedInput): Feed =
        Feed(feedService.addFeedForCurrentUser(input))

    @Secured("ROLE_USER")
    fun deleteFeed(feedId: UUID): Boolean =
        feedService.removeFeedForCurrentUser(feedId)

    @Secured("ROLE_USER")
    fun addGroup(input: GroupInput) =
        Group(groupService.addGroupForCurrentUser(input))

    @Secured("ROLE_USER")
    fun addFeedToGroup(feedId: UUID, groupId: UUID) =
        Group(groupService.addFeedToCurrentUserGroup(feedId = feedId, groupId = groupId))

    @Secured("ROLE_USER")
    fun toggleArticleUnread(id: UUID): Article? =
        articleService.toggleUnreadForCurrentUser(id)?.let { Article(it.first, it.second) }
}
