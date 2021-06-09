package de.martingansler.feeds.persistence.repository

import de.martingansler.feeds.persistence.entity.Feed
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface FeedRepository : JpaRepository<Feed, Long> {
    fun findByUri(uri: String): Feed?

    fun findById(id: UUID): Feed?
}
