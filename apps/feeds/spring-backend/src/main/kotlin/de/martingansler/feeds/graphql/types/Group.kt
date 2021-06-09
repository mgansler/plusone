package de.martingansler.feeds.graphql.types

import de.martingansler.feeds.persistence.entity.UserGroup
import java.util.UUID

data class Group(
    val id: UUID,
    val name: String,
    val feeds: List<Feed> = listOf()
) {
    constructor(userGroup: UserGroup) : this(
        id = userGroup.id,
        name = userGroup.name,
        feeds = userGroup.feeds.map { Feed(it.feed) }
    )
}
