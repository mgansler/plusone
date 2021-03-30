package de.martingansler.feeds.test.stubs

import de.martingansler.feeds.persistence.entity.Feed

object FeedEntityStub {
    fun create(identifier: Int = 1) =
        Feed(uri = "http://localhost/feeds/$identifier/feed.xml", hasFetchError = false)
}
