package de.martingansler.feeds.feed

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class DiscoveryTest {

    @Test
    fun findFeedUri() {
        assertEquals("http://feeds.arstechnica.com/arstechnica/index/", Discovery("https://arstechnica.com").findFeedUri())
        assertEquals("https://about.gitlab.com/atom.xml", Discovery("https://about.gitlab.com/blog").findFeedUri())
    }
}
