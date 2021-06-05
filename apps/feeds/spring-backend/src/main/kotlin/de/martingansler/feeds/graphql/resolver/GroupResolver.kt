package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Feed
import de.martingansler.feeds.graphql.types.Group
import de.martingansler.feeds.service.FeedService
import graphql.kickstart.tools.GraphQLResolver
import org.springframework.stereotype.Component

@Component
class GroupResolver(
    val feedService: FeedService
) : GraphQLResolver<Group> {
    fun feeds(group: Group): List<Feed> =
        feedService.feedsByGroupForCurrentUser(group.id).map { Feed(it.feed) }
}
