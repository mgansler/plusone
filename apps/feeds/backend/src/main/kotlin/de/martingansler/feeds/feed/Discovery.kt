package de.martingansler.feeds.feed

import com.rometools.rome.io.SyndFeedInput
import org.apache.logging.log4j.kotlin.Logging
import org.jsoup.Jsoup
import java.net.URI

class Discovery(
    val startUri: String
) {
    fun findFeedUri(): String {
        val finalUri = read(startUri)
            ?: findLink()

        if (finalUri != null) {
            return finalUri
        } else {
            throw NoFeedFoundException(startUri)
        }
    }

    private fun findLink(): String? {
        val document = Jsoup.connect(startUri).get()

        document.head().getElementsByTag("link").filter {
            it.attr("type").contains("rss") || it.attr("type").contains("atom")
        }.forEach {
            var href = it.attr("href")
            if (href.startsWith("/")) {
                href = "${URI(startUri).scheme}://${URI(startUri).host}$href"
            }

            logger.debug("trying $href")
            return read(href)
        }
        return null
    }

    @Suppress("SwallowedException")
    private fun read(feedUri: String): String? {
        return try {
            val reader = RssClient.get(feedUri).body?.reader()
            SyndFeedInput().build(reader)
            feedUri
        } catch (ex: java.lang.Exception) {
            null
        }
    }

    companion object : Logging
}
