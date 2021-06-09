package de.martingansler.feeds.service

import de.martingansler.feeds.graphql.types.ArticleFilterCriteria
import de.martingansler.feeds.graphql.types.Feed
import de.martingansler.feeds.persistence.entity.Article
import de.martingansler.feeds.persistence.entity.UserArticle
import de.martingansler.feeds.persistence.repository.UserArticleRepository
import de.martingansler.feeds.persistence.repository.UserFeedRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import kotlin.math.max
import kotlin.math.min

@Service
class ArticleService(
    val userService: UserService,
    private val userArticleRepository: UserArticleRepository,
    private val userFeedRepository: UserFeedRepository
) {

    fun addArticleForUsers(article: Article) {
        val feed = article.feed
        val users = userFeedRepository.findAllByFeed(feed).map { it.user }
        users.forEach { user ->
            userArticleRepository.findByUserAndArticleLink(user, article.link)
                ?: userArticleRepository.save(UserArticle(user = user, article = article, unread = true))
        }
    }

    fun articlesForCurrentUser(feed: Feed, unread: Boolean?, pageRequest: PageRequest): List<UserArticle> {
        val user = userService.findOrCreateUser()
        return if (unread != null) {
            userArticleRepository.findAllByUserAndArticleFeedIdAndUnreadOrderByArticlePublishedDateDesc(user, feed.id, unread, pageRequest)
        } else {
            userArticleRepository.findAllByUserAndArticleFeedIdOrderByArticlePublishedDateDesc(user, feed.id, pageRequest)
        }
    }

    fun articlesFilteredForCurrentUser(filterCriteria: ArticleFilterCriteria): List<UserArticle> {
        val user = userService.findOrCreateUser()
        val pageRequest = PageRequest.of(sanitizeOffset(filterCriteria.offset), sanitizeLimit(filterCriteria.limit))

        return if (filterCriteria.feedIds.isEmpty()) {
            userArticleRepository.findAllByUserOrderByUnreadDescArticlePublishedDateDesc(
                user = user,
                pageable = pageRequest
            )
        } else {
            userArticleRepository.findAllByUserAndArticleFeedIdIsInOrderByUnreadDescArticlePublishedDateDesc(
                user = user,
                feedIds = filterCriteria.feedIds,
                pageable = pageRequest
            )
        }
    }

    @Transactional
    fun toggleUnreadForCurrentUser(articleId: UUID): Pair<Article, Boolean>? {
        val userArticle = userArticleRepository.findByUserAndArticleId(userService.findOrCreateUser(), articleId)
            ?: return null

        userArticle.unread = !userArticle.unread

        val article = userArticleRepository.save(userArticle).article
        return Pair(article, userArticle.unread)
    }

    companion object {
        @Suppress("MagicNumber")
        private fun sanitizeLimit(limit: Int?): Int = if (limit == null) 10 else min(limit, 500)

        @Suppress("MagicNumber")
        private fun sanitizeOffset(offset: Int?): Int = if (offset == null) 0 else max(offset, 0)
    }
}
