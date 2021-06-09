package de.martingansler.feeds.feed.article

import com.rometools.rome.feed.synd.SyndEntry
import de.martingansler.feeds.persistence.entity.Article
import de.martingansler.feeds.persistence.entity.Feed
import org.apache.logging.log4j.kotlin.Logging
import org.jsoup.Jsoup
import java.util.Date

class CheerUpEmoKidArticleBuilder(val feed: Feed) : ArticleBuilder {
    @Suppress("TooGenericExceptionCaught")
    override fun fromSyndEntry(syndEntry: SyndEntry): Article {
        try {
            val document = Jsoup.connect(syndEntry.link).get()

            val main = document.body().getElementsByClass("panels")[0].getElementsByTag("source")
                .map { it.attr("data-srcset") }
                .first { !it.contains("mobile") && !it.contains("tablet") }
            val bonus = document.body().getElementsByClass("bonus-panels")[0]
                .getElementsByTag("img").attr("data-src")

            return Article(
                link = syndEntry.link,
                title = syndEntry.titleEx.value,
                author = "Enzo",
                publishedDate = syndEntry.publishedDate ?: Date(),
                updatedDate = syndEntry.updatedDate,
                content = "<img src=\"$main\" style=\"max-width: -webkit-fill-available\"/><img src=\"$bonus\" style=\"max-width: -webkit-fill-available\"/>",
                feed = this.feed
            )
        } catch (ex: Exception) {
            logger.error(ex)
            return DefaultArticleBuilder(feed).fromSyndEntry(syndEntry)
        }
    }

    companion object : Logging
}
