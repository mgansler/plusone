package de.martingansler.feeds.graphql.types

@Suppress("ConstructorParameterNaming")
data class Token(
    val access_token: String,
    val refresh_token: String,
    val scope: String,
    val token_type: String
)
