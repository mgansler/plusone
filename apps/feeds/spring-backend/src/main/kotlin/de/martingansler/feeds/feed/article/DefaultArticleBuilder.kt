package de.martingansler.feeds.feed.article

import com.rometools.rome.feed.synd.SyndEntry
import de.martingansler.feeds.persistence.entity.Article
import de.martingansler.feeds.persistence.entity.Feed
import java.util.Date

class DefaultArticleBuilder(val feed: Feed) : ArticleBuilder {
    override fun fromSyndEntry(syndEntry: SyndEntry): Article {
        val content = if (syndEntry.contents.size > 0) {
            syndEntry.contents[0].value
        } else {
            syndEntry.description?.value ?: syndEntry.titleEx.value
        }

        return Article(
            link = syndEntry.link,
            title = syndEntry.titleEx.value,
            author = syndEntry.author,
            publishedDate = syndEntry.publishedDate ?: Date(),
            updatedDate = syndEntry.updatedDate,
            content = content,
            feed = feed
        )
    }
}
