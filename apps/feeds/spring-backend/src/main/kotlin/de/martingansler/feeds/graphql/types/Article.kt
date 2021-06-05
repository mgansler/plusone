package de.martingansler.feeds.graphql.types

import de.martingansler.feeds.persistence.entity.Article
import java.time.LocalDateTime
import java.util.UUID

data class Article(
    val id: UUID,
    val link: String,
    val title: String,
    val author: String,
    val content: String,
    val publishedDate: LocalDateTime,
    val unread: Boolean,
    val feed: Feed
) {
    constructor(articleEntity: Article, unread: Boolean) : this(
        id = articleEntity.id,
        link = articleEntity.link,
        title = articleEntity.title,
        author = articleEntity.author,
        content = articleEntity.content,
        publishedDate = java.sql.Timestamp(articleEntity.publishedDate.time).toLocalDateTime(),
        unread = unread,
        feed = Feed(articleEntity.feed)
    )
}
