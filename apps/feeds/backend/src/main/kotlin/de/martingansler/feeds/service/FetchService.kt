package de.martingansler.feeds.service

import com.rometools.rome.io.ParsingFeedException
import com.rometools.rome.io.SyndFeedInput
import de.martingansler.feeds.feed.RssClient
import de.martingansler.feeds.feed.article.ArticleBuilderFactory
import de.martingansler.feeds.graphql.resolver.FeedPublisher
import de.martingansler.feeds.persistence.entity.Feed
import de.martingansler.feeds.persistence.repository.ArticleRepository
import de.martingansler.feeds.persistence.repository.FeedRepository
import org.apache.logging.log4j.kotlin.Logging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestClientException

@Service
@Transactional
class FetchService(
    private val feedRepository: FeedRepository,
    private val articleRepository: ArticleRepository,
    private val articleService: ArticleService,
    private val feedPublisher: FeedPublisher
) {
    @Scheduled(fixedRateString = "\${feeds.interval}000", initialDelay = 10000)
    fun fetchAll() {
        val feeds = feedRepository.findAll()
        feeds.forEach { fetchFeed(it) }

        logger.info("Total articles: ${articleRepository.count()}")
    }

    fun fetchFeed(feed: Feed) {
        try {
            val reader = RssClient.get(feed.uri).body?.reader()

            val fetchResult = SyndFeedInput().build(reader)
            feed.title = fetchResult.title
            feed.icon = fetchResult.image?.url
            feed.hasFetchError = false
            var newArticleCount = 0

            val articleBuilder = ArticleBuilderFactory.forFeed(feed)

            fetchResult.entries.forEach {
                val article = articleRepository.findByLink(it.link) ?: run {
                    newArticleCount++
                    articleBuilder.fromSyndEntry(it)
                }
                articleService.addArticleForUsers(articleRepository.save(article))
            }

            if (newArticleCount > 0) {
                feedPublisher.subject.onNext(feed)
                logger.info("Fetched $newArticleCount new articles for ${feed.uri}")
            }
        } catch (ex: RestClientException) {
            logger.error("Fetching of ${feed.uri} failed due to connection error: ${ex.localizedMessage}")
            logger.debug(ex)
            feed.hasFetchError = true
        } catch (ex: ParsingFeedException) {
            logger.error("Fetching of ${feed.uri} failed due to parsing error: ${ex.localizedMessage}")
            logger.debug(ex)
            feed.hasFetchError = true
        } catch (ex: IllegalStateException) {
            logger.error("Fetching of ${feed.uri} failed due to illegal state: ${ex.localizedMessage}")
            logger.debug(ex)
            feed.hasFetchError = true
        } catch (ex: IllegalArgumentException) {
            logger.error("Fetching of ${feed.uri} failed due to illegal argument: ${ex.localizedMessage}")
            logger.debug(ex)
            feed.hasFetchError = true
        } catch (ex: RuntimeException) {
            logger.error("Fetching of ${feed.uri} resulted in an unexpected exception: ${ex.localizedMessage}, ${ex.javaClass.name}")
            logger.debug(ex)
        } finally {
            feedRepository.save(feed)
        }
    }

    companion object : Logging
}
