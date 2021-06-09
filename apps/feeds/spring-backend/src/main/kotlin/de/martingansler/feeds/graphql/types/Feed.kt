package de.martingansler.feeds.graphql.types

import de.martingansler.feeds.persistence.entity.Feed
import java.util.UUID

data class Feed(
    val id: UUID,
    val uri: String,
    val title: String,
    val icon: String? = null,
    val articles: List<Article>,
    val group: Group? = null,
    val unreadCount: Int? = null,
    val totalCount: Int? = null,
    val hasFetchError: Boolean
) {
    constructor(feedEntity: Feed) : this(
        id = feedEntity.id,
        uri = feedEntity.uri,
        title = feedEntity.title ?: "",
        icon = feedEntity.icon,
        hasFetchError = feedEntity.hasFetchError,
        articles = listOf<Article>()
    )
}
