package de.martingansler.feeds.feed

import java.util.UUID

class FeedNotFoundException(feedId: UUID) : RuntimeException("Feed with id='$feedId' not found.")
