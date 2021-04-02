package de.martingansler.feeds.graphql.types

data class FeedInput(
    val uri: String,
    val title: String? = null
)
