package de.martingansler.feeds.service

import de.martingansler.feeds.graphql.types.ArticleFilterCriteria
import de.martingansler.feeds.persistence.entity.Feed
import de.martingansler.feeds.persistence.entity.User
import de.martingansler.feeds.persistence.entity.UserArticle
import de.martingansler.feeds.persistence.entity.UserFeed
import de.martingansler.feeds.persistence.repository.ArticleRepository
import de.martingansler.feeds.persistence.repository.FeedRepository
import de.martingansler.feeds.persistence.repository.UserArticleRepository
import de.martingansler.feeds.persistence.repository.UserFeedRepository
import de.martingansler.feeds.persistence.repository.UserRepository
import de.martingansler.feeds.test.stubs.ArticleEntityStub
import de.martingansler.feeds.test.stubs.FeedEntityStub
import de.martingansler.feeds.test.stubs.UserEntityStub
import de.martingansler.feeds.test.testcontainers.PostgreSQLIntegrationTest
import org.junit.Assert.assertEquals
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import java.util.UUID
import java.util.stream.Stream

@PostgreSQLIntegrationTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ArticleServiceTest {
    @Autowired
    private lateinit var articleService: ArticleService

    @Autowired
    private lateinit var userRepository: UserRepository
    @Autowired
    private lateinit var feedRepository: FeedRepository
    @Autowired
    private lateinit var userFeedRepository: UserFeedRepository
    @Autowired
    private lateinit var articleRepository: ArticleRepository
    @Autowired
    private lateinit var userArticleRepository: UserArticleRepository

    lateinit var user: User
    lateinit var feedOne: Feed
    lateinit var feedTwo: Feed
    lateinit var feedThr: Feed

    @BeforeAll
    fun beforeAll() {
        user = userRepository.save(UserEntityStub.create())

        SecurityContextHolder.getContext().authentication = OAuth2AuthenticationToken(
            DefaultOAuth2User(
                AuthorityUtils.createAuthorityList("ROLE_USER"),
                user.toMap(),
                "username"
            ),
            AuthorityUtils.createAuthorityList("ROLE_USER"),
            "gitlab"
        )

        feedOne = feedRepository.save(FeedEntityStub.create(1))
        feedTwo = feedRepository.save(FeedEntityStub.create(2))
        feedThr = feedRepository.save(FeedEntityStub.create(3))

        userFeedRepository.save(UserFeed(user = user, feed = feedOne))
        userFeedRepository.save(UserFeed(user = user, feed = feedTwo))
        userFeedRepository.save(UserFeed(user = user, feed = feedThr))

        for (articleNumber in 1..10) {
            val article = ArticleEntityStub.create(feed = feedOne, articleIdentifier = articleNumber)
            userArticleRepository.save(UserArticle(user = user, article = articleRepository.save(article), unread = true))
        }
        for (articleNumber in 1..7) {
            val article = ArticleEntityStub.create(feed = feedTwo, articleIdentifier = articleNumber)
            userArticleRepository.save(UserArticle(user = user, article = articleRepository.save(article), unread = true))
        }
        for (articleNumber in 1..5) {
            val article = ArticleEntityStub.create(feed = feedThr, articleIdentifier = articleNumber)
            userArticleRepository.save(UserArticle(user = user, article = articleRepository.save(article), unread = true))
        }
    }

    @Test
    fun `gets articles from all feeds when no feedId is given`() {
        val articles = articleService.articlesFilteredForCurrentUser(filterCriteria = ArticleFilterCriteria(limit = 20, offset = 0))

        assertEquals(20, articles.size)
    }

    @ParameterizedTest
    @MethodSource("feedIdProvider")
    fun `gets articles for provided feed id only`(pair: Pair<UUID, Int>) {
        val articles = articleService.articlesFilteredForCurrentUser(
            filterCriteria = ArticleFilterCriteria(feedIds = listOf(pair.first), limit = 20, offset = 0)
        )

        assertEquals(pair.second, articles.size)
        articles.forEach {
            assertEquals(pair.first, it.article.feed.id)
        }
    }

    fun feedIdProvider(): Stream<Pair<UUID, Int>> =
        Stream.of(Pair(feedOne.id, 10), Pair(feedTwo.id, 7), Pair(feedThr.id, 5))

    @Test
    fun `gets articles for provided list of feed ids only`() {
        val articlesForList = articleService.articlesFilteredForCurrentUser(
            filterCriteria = ArticleFilterCriteria(feedIds = listOf(feedOne.id, feedTwo.id), limit = 20, offset = 0)
        )
        assertEquals(17, articlesForList.size)
    }
}
