package de.martingansler.feeds.feed.article

import com.rometools.rome.feed.synd.SyndEntry
import de.martingansler.feeds.persistence.entity.Article
import de.martingansler.feeds.persistence.entity.Feed
import org.jsoup.nodes.Element
import java.util.Date

class YoutubeArticleBuilder(val feed: Feed) : ArticleBuilder {
    override fun fromSyndEntry(syndEntry: SyndEntry): Article {
        val content = Element("iframe")
            .attr("src", syndEntry.link.replace("watch?v=", "embed/"))
            .attr("frameborder", "0")
            .attr("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture")
            .attr("allowfullscreen", true)

        return Article(
            link = syndEntry.link,
            title = syndEntry.titleEx.value,
            author = syndEntry.author,
            publishedDate = syndEntry.publishedDate ?: Date(),
            updatedDate = syndEntry.updatedDate,
            content = content.toString(),
            feed = feed
        )
    }
}
