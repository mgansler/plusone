package de.martingansler.feeds.feed.article

import de.martingansler.feeds.persistence.entity.Feed

object ArticleBuilderFactory {
    fun forFeed(feed: Feed): ArticleBuilder =
        when {
            feed.uri.contains("cheerupemokid.com") -> CheerUpEmoKidArticleBuilder(feed)
            feed.uri.contains("dilbert.com") -> DilbertArticleBuilder(feed)
            feed.uri.contains("youtube.com") -> YoutubeArticleBuilder(feed)
            else -> DefaultArticleBuilder(feed)
        }
}
