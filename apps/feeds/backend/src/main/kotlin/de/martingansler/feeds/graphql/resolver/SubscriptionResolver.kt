package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Feed
import graphql.kickstart.tools.GraphQLSubscriptionResolver
import org.reactivestreams.Publisher
import org.springframework.stereotype.Component

@Component
class SubscriptionResolver(
    val feedPublisher: FeedPublisher
) : GraphQLSubscriptionResolver {
    fun feed(): Publisher<Feed> = feedPublisher.getPublisher()
}
