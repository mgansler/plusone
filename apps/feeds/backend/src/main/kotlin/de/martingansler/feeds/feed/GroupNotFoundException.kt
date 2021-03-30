package de.martingansler.feeds.feed

import java.util.UUID

class GroupNotFoundException(feedId: UUID) : RuntimeException("Group with id='$feedId' not found.")
