package de.martingansler.feeds.graphql.types

import de.martingansler.feeds.persistence.entity.User

@Suppress("ConstructorParameterNaming")
data class User(
    val username: String,
    val name: String? = null,
    val email: String? = null,
    val avatar_url: String? = null
) {
    constructor(userEntity: User) : this(
        username = userEntity.username,
        name = userEntity.name,
        email = userEntity.email,
        avatar_url = userEntity.avatar_url
    )
}
