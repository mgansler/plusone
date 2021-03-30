package de.martingansler.feeds.feed

class NoFeedFoundException(sourceUri: String) : RuntimeException("No Feed could be found for '$sourceUri'")
