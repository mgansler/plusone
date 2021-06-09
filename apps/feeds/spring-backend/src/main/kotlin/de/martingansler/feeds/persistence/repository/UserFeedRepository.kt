package de.martingansler.feeds.persistence.repository

import de.martingansler.feeds.persistence.entity.Feed
import de.martingansler.feeds.persistence.entity.User
import de.martingansler.feeds.persistence.entity.UserFeed
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserFeedRepository : JpaRepository<UserFeed, UUID> {
    fun findAllByUserOrderByFeedTitleAsc(user: User): List<UserFeed>

    fun findByFeedAndUser(feed: Feed, user: User): UserFeed?

    fun findByFeedIdAndUser(feedId: UUID, user: User): UserFeed?

    fun findAllByFeed(feed: Feed): List<UserFeed>

    fun findAllByUserAndGroupId(user: User, groupId: UUID): List<UserFeed>
}
