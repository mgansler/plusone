package de.martingansler.feeds.service

import com.rometools.opml.feed.opml.Outline
import de.martingansler.feeds.feed.Discovery
import de.martingansler.feeds.graphql.types.FeedInput
import de.martingansler.feeds.persistence.entity.Feed
import de.martingansler.feeds.persistence.entity.User
import de.martingansler.feeds.persistence.entity.UserFeed
import de.martingansler.feeds.persistence.repository.FeedRepository
import de.martingansler.feeds.persistence.repository.UserArticleRepository
import de.martingansler.feeds.persistence.repository.UserFeedRepository
import org.apache.logging.log4j.kotlin.Logging
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FeedService(
    private val userService: UserService,
    private val fetchService: FetchService,
    private val feedRepository: FeedRepository,
    private val userArticleRepository: UserArticleRepository,
    private val userFeedRepository: UserFeedRepository
) {
    fun allFeedsForCurrentUser() =
        userFeedRepository.findAllByUserOrderByFeedTitleAsc(userService.findOrCreateUser())

    fun feedsByGroupForCurrentUser(groupId: UUID) =
        userFeedRepository.findAllByUserAndGroupId(userService.findOrCreateUser(), groupId)

    fun unreadCountByFeedForCurrentUser(feedId: UUID) =
        userArticleRepository.countByUserAndArticleFeedIdAndUnreadIsTrue(userService.findOrCreateUser(), feedId)

    fun totalCountByFeedForCurrentUser(feedId: UUID) =
        userArticleRepository.countByUserAndArticleFeedId(userService.findOrCreateUser(), feedId)

    fun addFeedForUser(feedOutline: Outline, user: User): Feed =
        findOrCreateForUser(feedOutline.xmlUrl, feedOutline.title, user)

    fun addFeedForCurrentUser(input: FeedInput): Feed =
        findOrCreateForUser(input.uri, input.title, userService.findOrCreateUser())

    @Suppress("ReturnCount")
    fun removeFeedForCurrentUser(feedId: UUID): Boolean {
        val feed = feedRepository.findById(feedId) ?: return false
        val userFeed = userFeedRepository.findByFeedAndUser(feed = feed, user = userService.findOrCreateUser())
            ?: return false

        userFeed.group = null

        userFeedRepository.save(userFeed)
        userFeedRepository.delete(userFeed)

        if (userFeedRepository.findAllByFeed(feed).isEmpty()) {
            logger.info("Removing feed ${feed.uri} as there are no more user")
            feedRepository.delete(feed)
        }

        return true
    }

    private fun findOrCreateForUser(uri: String, title: String?, user: User): Feed {
        val feedUri = Discovery(uri).findFeedUri()

        val feed = feedRepository.findByUri(uri)
            ?: feedRepository.save(Feed(uri = feedUri, title = title ?: feedUri, hasFetchError = false))

        userFeedRepository.findByFeedAndUser(feed = feed, user = user)
            ?: userFeedRepository.save(UserFeed(feed = feed, user = user))

        fetchService.fetchFeed(feed)
        return feed
    }

    companion object : Logging
}
