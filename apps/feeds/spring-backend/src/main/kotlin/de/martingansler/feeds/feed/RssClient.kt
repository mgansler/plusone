package de.martingansler.feeds.feed

import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.converter.StringHttpMessageConverter
import org.springframework.util.MultiValueMap
import org.springframework.web.client.RestTemplate
import java.nio.charset.StandardCharsets

object RssClient {
    private val headers = HttpHeaders().apply {
        set(HttpHeaders.USER_AGENT, "feeds")
    }

    private val restTemplate: RestTemplate = RestTemplate()

    init {
        restTemplate.messageConverters.add(0, StringHttpMessageConverter(StandardCharsets.UTF_8))
    }

    fun get(uri: String) = restTemplate.exchange(
        uri,
        HttpMethod.GET,
        HttpEntity<MultiValueMap<String, String>>(headers),
        String::class.java
    )
}
