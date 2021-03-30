package de.martingansler.feeds.feed.article

import com.rometools.rome.feed.synd.SyndEntry
import de.martingansler.feeds.persistence.entity.Article
import de.martingansler.feeds.persistence.entity.Feed
import org.jsoup.Jsoup
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class DilbertArticleBuilder(val feed: Feed) : ArticleBuilder {
    override fun fromSyndEntry(syndEntry: SyndEntry): Article {
        val document = Jsoup.connect(syndEntry.link).get()

        val titleTag = document.head().getElementsByAttributeValue("property", "og:title")
        val authorTag = document.head().getElementsByAttributeValue("property", "article:author")
        val contentTag = document.body().getElementsByClass("img-comic")

        return Article(
            link = syndEntry.link,
            title = "${titleTag.attr("content")} | ${syndEntry.titleEx.value}",
            author = authorTag.attr("content") ?: "Scott Adams",
            publishedDate = java.sql.Date.valueOf(LocalDate.parse(syndEntry.uri, DateTimeFormatter.ISO_DATE)),
            updatedDate = syndEntry.updatedDate,
            content = contentTag.toString().replace("href=\"//", "href=\"https://"),
            feed = this.feed
        )
    }
}
