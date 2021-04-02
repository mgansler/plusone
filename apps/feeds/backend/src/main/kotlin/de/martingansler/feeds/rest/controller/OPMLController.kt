package de.martingansler.feeds.rest.controller

import com.rometools.opml.feed.opml.Opml
import com.rometools.opml.feed.opml.Outline
import com.rometools.opml.io.impl.OPML10Parser
import com.rometools.rome.io.SyndFeedInput
import de.martingansler.feeds.service.FeedService
import de.martingansler.feeds.service.UserService
import org.apache.logging.log4j.kotlin.Logging
import org.jdom2.input.SAXBuilder
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.stereotype.Controller
import org.springframework.util.MultiValueMap
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.client.RestTemplate
import org.springframework.web.multipart.MultipartFile
import java.net.URL
import java.security.Principal
import java.util.Locale

@Controller
@RequestMapping("/api/opml")
class OPMLController(
    val userService: UserService,
    val feedService: FeedService,
    val restTemplate: RestTemplate
) {
    @Secured("ROLE_USER")
    @PostMapping("/import")
    @ResponseStatus(value = HttpStatus.OK)
    @Suppress("NestedBlockDepth", "TooGenericExceptionCaught")
    fun handleImport(@RequestParam("file") file: MultipartFile, principal: Principal) {
        val user = userService.findOrCreateUser(principal)

        val parser = OPML10Parser()
        val document = SAXBuilder().build(file.inputStream)
        val parsed: Opml = parser.parse(document, false, Locale.GERMANY) as Opml

        for (outline in parsed.outlines) {
            for (feed in outline.children) {
                try {
                    val httpsFeed = Outline(
                        feed.title,
                        URL(feed.xmlUrl.replace("http://", "https://")),
                        URL(feed.htmlUrl)
                    )

                    val headers = HttpHeaders().apply {
                        set(HttpHeaders.USER_AGENT, "feeds")
                    }
                    val reader = restTemplate.exchange(
                        httpsFeed.xmlUrl,
                        HttpMethod.GET,
                        HttpEntity<MultiValueMap<String, String>>(headers),
                        String::class.java
                    ).body?.reader()

                    SyndFeedInput().build(reader)

                    feedService.addFeedForUser(httpsFeed, user)
                } catch (ex: Exception) {
                    logger.error("could not import feed: ${feed.xmlUrl.replace("http://", "https://")}: ${ex.localizedMessage}")
                }
            }
        }

        logger.info("imported file ${file.name} with size ${file.size}")
    }

    companion object : Logging
}
