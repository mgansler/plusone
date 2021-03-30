package de.martingansler.feeds.graphql.types

import java.util.UUID

data class ArticleFilterCriteria(
    val feedIds: List<UUID> = listOf(),
    val limit: Int?,
    val offset: Int?
)
