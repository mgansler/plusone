package de.martingansler.feeds.test.stubs

import de.martingansler.feeds.persistence.entity.Article
import de.martingansler.feeds.persistence.entity.Feed

object ArticleEntityStub {
    fun create(
        author: String = "Author",
        content: String = "<div>feed content</div>",
        feed: Feed = FeedEntityStub.create(),
        articleIdentifier: Int = 1
    ) =
        Article(
            author = author,
            content = content,
            feed = feed,
            link = "http://localhost/feed/${feed.id}/articles/$articleIdentifier",
            title = "Article $articleIdentifier"
        )
}
