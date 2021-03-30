package de.martingansler.feeds.feed.article

import com.rometools.rome.feed.synd.SyndEntry
import de.martingansler.feeds.persistence.entity.Article

interface ArticleBuilder {
    fun fromSyndEntry(syndEntry: SyndEntry): Article
}
