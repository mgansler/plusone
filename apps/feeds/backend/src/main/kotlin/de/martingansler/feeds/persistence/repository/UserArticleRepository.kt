package de.martingansler.feeds.persistence.repository

import de.martingansler.feeds.persistence.entity.User
import de.martingansler.feeds.persistence.entity.UserArticle
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
@Suppress("FunctionMaxLength")
interface UserArticleRepository : JpaRepository<UserArticle, UUID> {
    fun findByUserAndArticleLink(user: User, link: String): UserArticle?

    fun findByUserAndArticleId(user: User, id: UUID): UserArticle?

    fun findAllByUserAndArticleFeedIdOrderByArticlePublishedDateDesc(
        user: User,
        feedId: UUID,
        pageable: Pageable
    ): List<UserArticle>

    fun findAllByUserAndArticleFeedIdAndUnreadOrderByArticlePublishedDateDesc(
        user: User,
        feedId: UUID,
        unread: Boolean,
        pageable: Pageable
    ): List<UserArticle>

    fun findAllByUserOrderByUnreadDescArticlePublishedDateDesc(
        user: User,
        pageable: Pageable
    ): List<UserArticle>

    fun findAllByUserAndArticleFeedIdIsInOrderByUnreadDescArticlePublishedDateDesc(
        user: User,
        feedIds: List<UUID>,
        pageable: Pageable
    ): List<UserArticle>

    fun countByUserAndArticleFeedIdAndUnreadIsTrue(user: User, feedId: UUID): Int

    fun countByUserAndArticleFeedId(user: User, feedId: UUID): Int
}
